import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL) {
	throw new Error("Missing env variable SUPABASE_URL");
}

if (!process.env.SUPABASE_API_KEY) {
	throw new Error("Missing env variable SUPABASE_API_KEY");
}

export default createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_API_KEY,
);
