import { tokenMap } from "./tokenMap";


export class CookieMiddleware {
	constructor(options = {}) {
		const {
			requestRegExp = /^\/cookie\/?\?/
		} = options;
		
		this.listeners = { GET: [
			[ requestRegExp, this.handler ]
		] };
		
	}
	
	handler = (request, response) => {
		const token = request.url.split("?")[1];
		
		if (token && tokenMap.has(token))
			response.writeHead(200, {
				"Content-Type": "text/plain; charset=utf-8",
				"Set-Cookie": CookieMiddleware.cookify(...tokenMap.getWithTimeout(token))
			}).end();
		else
			return false;
		
	};
	
	
	static make({ name, value, maxAge, expiresAt, domain, path = "/", secure = true, httpOnly = true, sameSite = "Strict" }) {
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
	
	static cookify(object, options) {
		return Object.entries(object).map(([ name, value ]) => this.make({ name, value, ...options }));
	}
	
}
