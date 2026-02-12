import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getSessionSecret(): string {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
        throw new Error("Missing required environment variable: SESSION_SECRET");
    }
    if (secret.length < 32) {
        throw new Error("SESSION_SECRET must be at least 32 characters");
    }
    return secret;
}

const COOKIE_NAME = "session";
const BCRYPT_ROUNDS = 12;
const DEFAULT_MAX_AGE = 86400; // 24 hours

export interface SessionPayload {
    userId: number;
    role: "user" | "admin";
}

function getJwtIssuer(): string {
    return process.env.JWT_ISSUER?.trim() || "memeconsole";
}

function getJwtAudience(): string {
    return process.env.JWT_AUDIENCE?.trim() || "memeconsole-web";
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function createSessionToken(
    userId: number,
    role: "user" | "admin",
    maxAge: number = DEFAULT_MAX_AGE
): string {
    return jwt.sign({ userId, role }, getSessionSecret(), {
        algorithm: "HS256",
        expiresIn: maxAge,
        issuer: getJwtIssuer(),
        audience: getJwtAudience(),
    });
}

export function verifySessionToken(token: string): SessionPayload | null {
    try {
        const payload = jwt.verify(token, getSessionSecret(), {
            algorithms: ["HS256"],
            issuer: getJwtIssuer(),
            audience: getJwtAudience(),
        }) as SessionPayload;
        if (
            !payload ||
            typeof payload !== "object" ||
            typeof payload.userId !== "number" ||
            (payload.role !== "user" && payload.role !== "admin")
        ) {
            return null;
        }
        return { userId: payload.userId, role: payload.role };
    } catch {
        return null;
    }
}

export function createSession(
    response: NextResponse,
    userId: number,
    role: "user" | "admin",
    rememberMe: boolean = false
): string {
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : DEFAULT_MAX_AGE;
    const token = createSessionToken(userId, role, maxAge);
    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge,
    });
    return token;
}

export async function getSession(
    cookieStore?: Awaited<ReturnType<typeof cookies>>
): Promise<SessionPayload | null> {
    const store = cookieStore ?? (await cookies());
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

export function getSessionFromHeader(
    cookieHeader: string | null
): SessionPayload | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match) return null;
    return verifySessionToken(decodeURIComponent(match[1]));
}

export function destroySession(response: NextResponse): void {
    response.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });
}

export const setSessionCookie = createSession;
export const clearSessionCookie = destroySession;
