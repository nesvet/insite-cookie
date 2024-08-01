export type Cookie = Record<string, unknown>;

export type CookieOptions = {
	maxAge?: number;
	expiresAt?: Date;
	domain?: string;
	path?: false | null | string;
	secure?: boolean;
	httpOnly?: boolean;
	sameSite?: string;
};
