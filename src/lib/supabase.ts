import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xashkbeozbfuynjcxxjc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_M7CL7HmhntqMyAxrSOCI_g_k2Szwc29";

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
