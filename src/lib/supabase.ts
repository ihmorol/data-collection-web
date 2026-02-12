import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseServiceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

let serverClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

export function createServerSupabaseClient(): SupabaseClient {
    if (!serverClient) {
        serverClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
    return serverClient;
}

export function createBrowserSupabaseClient(): SupabaseClient {
    if (!browserClient) {
        browserClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: true, autoRefreshToken: true },
        });
    }
    return browserClient;
}
