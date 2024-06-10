import { createClient } from "@supabase/supabase-js";

if (!import.meta.env.VITE_SUPABASE_URL) {
	throw new Error("Missing env variable SUPABASE_URL");
}

if (!import.meta.env.VITE_SUPABASE_API_KEY) {
	throw new Error("Missing env variable SUPABASE_API_KEY");
}

export default createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_API_KEY,
);
