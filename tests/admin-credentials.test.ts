import assert from "node:assert/strict";
import test from "node:test";
import { getAdminCredentialsFromEnv } from "../src/lib/admin-credentials";

test("uses bootstrap admin credentials when non-empty", () => {
    const credentials = getAdminCredentialsFromEnv({
        ADMIN_BOOTSTRAP_USERNAME: "bootstrap_admin",
        ADMIN_BOOTSTRAP_PASSWORD: "bootstrap-password",
        ADMIN_USERNAME: "legacy_admin",
        ADMIN_PASSWORD: "legacy-password",
    });

    assert.equal(credentials.username, "bootstrap_admin");
    assert.equal(credentials.password, "bootstrap-password");
});

test("falls back to legacy admin credentials when bootstrap values are empty", () => {
    const credentials = getAdminCredentialsFromEnv({
        ADMIN_BOOTSTRAP_USERNAME: " ",
        ADMIN_BOOTSTRAP_PASSWORD: "",
        ADMIN_USERNAME: "legacy_admin",
        ADMIN_PASSWORD: "legacy-password",
    });

    assert.equal(credentials.username, "legacy_admin");
    assert.equal(credentials.password, "legacy-password");
});

test("throws when no valid admin credentials are provided", () => {
    assert.throws(
        () =>
            getAdminCredentialsFromEnv({
                ADMIN_BOOTSTRAP_USERNAME: "",
                ADMIN_BOOTSTRAP_PASSWORD: "",
                ADMIN_USERNAME: "",
                ADMIN_PASSWORD: "",
            }),
        /Missing or invalid ADMIN_BOOTSTRAP_USERNAME/
    );
});
