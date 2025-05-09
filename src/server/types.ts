export type Cookie = Record<string, string>;

export type CookieOptions = {
	maxAge?: number;
	expiresAt?: Date;
	domain?: string;
	path?: false | null | string;
	secure?: boolean;
	httpOnly?: boolean;
	sameSite?: string;
};
