export type AdminCredentials = {
    username: string;
    password: string;
};

function firstNonEmpty(...values: Array<string | undefined>): string | null {
    for (const value of values) {
        if (typeof value !== "string") continue;
        if (value.trim().length > 0) return value;
    }
    return null;
}

export function getAdminCredentialsFromEnv(
    env: NodeJS.ProcessEnv = process.env
): AdminCredentials {
    const username =
        firstNonEmpty(env.ADMIN_BOOTSTRAP_USERNAME, env.ADMIN_USERNAME)?.trim() ??
        "";
    const password =
        firstNonEmpty(env.ADMIN_BOOTSTRAP_PASSWORD, env.ADMIN_PASSWORD) ?? "";

    if (username.length < 3) {
        throw new Error(
            "Missing or invalid ADMIN_BOOTSTRAP_USERNAME (or ADMIN_USERNAME fallback)"
        );
    }
    if (password.length < 10) {
        throw new Error(
            "Missing or invalid ADMIN_BOOTSTRAP_PASSWORD (or ADMIN_PASSWORD fallback). Use at least 10 chars."
        );
    }

    return { username, password };
}
