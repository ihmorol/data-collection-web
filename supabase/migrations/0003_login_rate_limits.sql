CREATE TABLE IF NOT EXISTS login_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  attempt_count INTEGER NOT NULL CHECK (attempt_count >= 0),
  window_started_at TIMESTAMPTZ NOT NULL,
  blocked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_rate_limits_updated_at
  ON login_rate_limits(updated_at);

CREATE INDEX IF NOT EXISTS idx_login_rate_limits_blocked_until
  ON login_rate_limits(blocked_until)
  WHERE blocked_until IS NOT NULL;

ALTER TABLE login_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_all_login_rate_limits ON login_rate_limits;
CREATE POLICY deny_all_login_rate_limits ON login_rate_limits
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION consume_login_attempt(
  p_ip_hash TEXT,
  p_window_seconds INTEGER,
  p_max_attempts INTEGER,
  p_now TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (limited BOOLEAN, retry_after_seconds INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  current_row login_rate_limits%ROWTYPE;
  window_end TIMESTAMPTZ;
BEGIN
  IF p_ip_hash IS NULL OR length(trim(p_ip_hash)) = 0 THEN
    RAISE EXCEPTION 'p_ip_hash is required';
  END IF;
  IF p_window_seconds <= 0 THEN
    RAISE EXCEPTION 'p_window_seconds must be greater than 0';
  END IF;
  IF p_max_attempts <= 0 THEN
    RAISE EXCEPTION 'p_max_attempts must be greater than 0';
  END IF;

  LOOP
    SELECT * INTO current_row
    FROM login_rate_limits
    WHERE ip_hash = p_ip_hash
    FOR UPDATE;

    IF FOUND THEN
      IF current_row.blocked_until IS NOT NULL AND current_row.blocked_until > p_now THEN
        RETURN QUERY
        SELECT
          true,
          GREATEST(1, CEIL(EXTRACT(EPOCH FROM (current_row.blocked_until - p_now)))::INTEGER);
        RETURN;
      END IF;

      window_end := current_row.window_started_at + make_interval(secs => p_window_seconds);

      IF p_now >= window_end THEN
        UPDATE login_rate_limits
        SET attempt_count = 1,
            window_started_at = p_now,
            blocked_until = NULL,
            updated_at = p_now
        WHERE ip_hash = p_ip_hash;

        RETURN QUERY SELECT false, 0;
        RETURN;
      END IF;

      current_row.attempt_count := current_row.attempt_count + 1;

      IF current_row.attempt_count > p_max_attempts THEN
        UPDATE login_rate_limits
        SET attempt_count = current_row.attempt_count,
            blocked_until = window_end,
            updated_at = p_now
        WHERE ip_hash = p_ip_hash;

        RETURN QUERY
        SELECT
          true,
          GREATEST(1, CEIL(EXTRACT(EPOCH FROM (window_end - p_now)))::INTEGER);
        RETURN;
      END IF;

      UPDATE login_rate_limits
      SET attempt_count = current_row.attempt_count,
          blocked_until = NULL,
          updated_at = p_now
      WHERE ip_hash = p_ip_hash;

      RETURN QUERY SELECT false, 0;
      RETURN;
    END IF;

    BEGIN
      INSERT INTO login_rate_limits (
        ip_hash,
        attempt_count,
        window_started_at,
        blocked_until,
        updated_at
      ) VALUES (
        p_ip_hash,
        1,
        p_now,
        NULL,
        p_now
      );

      RETURN QUERY SELECT false, 0;
      RETURN;
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
    END;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_login_rate_limits(
  p_stale_after_seconds INTEGER DEFAULT 86400
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  IF p_stale_after_seconds <= 0 THEN
    RAISE EXCEPTION 'p_stale_after_seconds must be greater than 0';
  END IF;

  DELETE FROM login_rate_limits
  WHERE updated_at < NOW() - make_interval(secs => p_stale_after_seconds);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
