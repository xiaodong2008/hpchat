import type { Session, User } from "@supabase/supabase-js";

import db from ".";

interface SignResponse {
	user: User | null;
	session: Session | null;
}

export async function login(
	email: string,
	password: string,
	token: string,
): Promise<string | SignResponse> {
	const { data, error } = await db.auth.signInWithPassword({
		email,
		password,
		options: {
			captchaToken: token,
		},
	});

	if (error) return error.message;
	return data;
}

export async function register(
	email: string,
	password: string,
	token: string,
): Promise<SignResponse | string> {
	const { data, error } = await db.auth.signUp({
		email,
		password,
		options: {
			captchaToken: token,
		},
	});

	if (error) return error.message;
	return data;
}

export async function logout(): Promise<string | undefined> {
	const { error } = await db.auth.signOut();

	if (error) return error.message;
}
