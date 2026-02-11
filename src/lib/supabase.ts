import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let serverClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

export function createServerSupabaseClient(): SupabaseClient {
    if (serverClient) return serverClient;
    serverClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return serverClient;
}

export function createBrowserSupabaseClient(): SupabaseClient {
    if (browserClient) return browserClient;
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
    return browserClient;
}
