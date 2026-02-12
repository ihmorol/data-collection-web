import type { NextConfig } from "next";

const supabaseOrigin = (() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return "https://*.supabase.co";
    try {
        return new URL(url).origin;
    } catch {
        return "https://*.supabase.co";
    }
})();

const contentSecurityPolicy = [
    "default-src 'self'",
    // Next.js injects a small inline bootstrap script needed for hydration.
    // Without 'unsafe-inline' in production, client components become non-interactive.
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' ${supabaseOrigin} https://*.supabase.co wss://*.supabase.co`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: contentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
                    },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
