import type { IncomingMessage, ServerResponse } from "node:http";
import { getWithTimeout } from "@nesvet/n";
import { InSiteServerMiddleware } from "insite-http";
import { tokenMap } from "./tokenMap";
import type { Cookie, CookieOptions } from "./types";


type Options = {
	requestRegExp?: RegExp;
};

export type { Options as CookieMiddlewareOptions };

type MakeArg = {
	name: keyof Cookie;
	value: Cookie[keyof Cookie];
} & CookieOptions;


export class InSiteCookieMiddleware extends InSiteServerMiddleware {
	constructor(options: Options = {}) {
		super();
		
		const {
			requestRegExp = /^\/cookie\/?\?/
		} = options;
		
		this.listeners = { GET: [
			[ requestRegExp, this.#handler ]
		] };
		
	}
	
	#handler = (request: IncomingMessage, response: ServerResponse) => {
		const [ , token ] = request.url!.split("?");
		
		if (token && tokenMap.has(token))
			return response.writeHead(200, {
				"Content-Type": "text/plain; charset=utf-8",
				"Set-Cookie": InSiteCookieMiddleware.cookify(...getWithTimeout(tokenMap, token)!)
			}).end();
		
		
		return false;
	};
	
	
	static make({ name, value, maxAge, expiresAt, domain, path = "/", secure = true, httpOnly = true, sameSite = "Strict" }: MakeArg) {
		const cookie = [ `${name}=${value}` ];
		
		if (maxAge !== undefined)
			cookie.push(`Max-Age=${maxAge}`);
		else if (expiresAt)
			cookie.push(`Max-Age=${Math.round((expiresAt.getTime() - Date.now()) / 1000)}`);
		
		if (domain)
			cookie.push(`Domain=${domain}`);
		
		if (path)
			cookie.push(`Path=${path}`);
		
		if (secure)
			cookie.push("Secure");
		
		if (httpOnly)
			cookie.push("HttpOnly");
		
		if (sameSite)
			cookie.push(`SameSite=${sameSite}`);
		
		return cookie.join("; ");
	}
	
	static cookify(cookie: Cookie, options: CookieOptions) {
		return Object.entries(cookie).map(([ name, value ]) => this.make({ name, value, ...options }));
	}
	
}
