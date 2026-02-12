import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import {
    checkLoginRateLimit,
    resetRateLimitFallbackForTests,
} from "../src/lib/rate-limit";

function makeRequest(ip: string): NextRequest {
    return new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
            "x-forwarded-for": ip,
        },
    });
}

test("uses database limiter result when available", async () => {
    const request = makeRequest("203.0.113.10");

    const result = await checkLoginRateLimit(request, {
        consumeAttempt: async (ipHash) => {
            assert.equal(ipHash.length, 64);
            return { limited: true, retryAfterSeconds: 17 };
        },
        fallback: () => {
            throw new Error("fallback must not be used");
        },
    });

    assert.deepEqual(result, { limited: true, retryAfterSeconds: 17 });
});

test("falls back to localhost limiter when database limiter is unavailable", async () => {
    resetRateLimitFallbackForTests();
    const request = makeRequest("203.0.113.11");

    for (let i = 0; i < 5; i += 1) {
        const result = await checkLoginRateLimit(request, {
            consumeAttempt: async () => null,
        });
        assert.equal(result.limited, false);
    }

    const limited = await checkLoginRateLimit(request, {
        consumeAttempt: async () => null,
    });
    assert.equal(limited.limited, true);
    assert.ok(limited.retryAfterSeconds >= 1);
});

test("tracks localhost fallback counters per client IP", async () => {
    resetRateLimitFallbackForTests();
    const firstIpRequest = makeRequest("203.0.113.12");
    const secondIpRequest = makeRequest("203.0.113.13");

    for (let i = 0; i < 6; i += 1) {
        await checkLoginRateLimit(firstIpRequest, {
            consumeAttempt: async () => null,
        });
    }

    const secondIpResult = await checkLoginRateLimit(secondIpRequest, {
        consumeAttempt: async () => null,
    });
    assert.equal(secondIpResult.limited, false);
});
