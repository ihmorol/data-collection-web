import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { validateCsrfOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
    const csrfError = validateCsrfOrigin(request);
    if (csrfError) return csrfError;

    const response = NextResponse.json({ success: true });
    destroySession(response);
    return response;
}
