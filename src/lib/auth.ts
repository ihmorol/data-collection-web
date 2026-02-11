import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = "session";
const BCRYPT_ROUNDS = 12;
const DEFAULT_MAX_AGE = 86400; // 24 hours

export interface SessionPayload {
    userId: number;
    role: "user" | "admin";
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
    role: "user" | "admin"
): string {
    return jwt.sign({ userId, role }, SESSION_SECRET, {
        expiresIn: DEFAULT_MAX_AGE,
    });
}

export function verifySessionToken(token: string): SessionPayload | null {
    try {
        const payload = jwt.verify(token, SESSION_SECRET) as SessionPayload;
        return payload;
    } catch {
        return null;
    }
}

export function setSessionCookie(
    response: NextResponse,
    userId: number,
    role: "user" | "admin",
    rememberMe: boolean = false
): void {
    const token = createSessionToken(userId, role);
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : DEFAULT_MAX_AGE;
    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge,
    });
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

export function getSessionFromHeader(
    cookieHeader: string | null
): SessionPayload | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match) return null;
    return verifySessionToken(match[1]);
}

export function clearSessionCookie(response: NextResponse): void {
    response.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });
}
