import crypto from "node:crypto";
import { headers } from "../common";
import { parseCookie } from "./parse";
import { tokenMap } from "./tokenMap";


const cookieTokenTimeout = 2000;
const cookieSessionIdSymbol = Symbol("cookieSessionId");


export class CookieSetter {
	constructor(wss, { users, domain, maxAge }) {
		wss.cookieSetter = this;
		
		this.domain = domain ?? process.env.INSITE_HOST;
		this.maxAge = maxAge ?? users?.sessions.collection.expireAfterSeconds;
		
		if (users) {
			this.users = users;
			
			wss.on("client-connect", CookieSetter.handleClientConnect);
			wss.on("client-session", CookieSetter.handleClientSession);
		}
		
	}
	
	
	static set(cookie, options) {
		
		const token = `${Math.round(performance.now() * Number.MAX_SAFE_INTEGER).toString(36)}$${crypto.randomBytes(Math.randomInt(4, 8)).toString("hex")}`;
		
		tokenMap.setWithTimeout(token, [ cookie, options ], cookieTokenTimeout);
		
		this.sendMessage(headers.set, token);
		
	}
	
	static unset(names) {
		this.setCookie(names.reduce((cookie, name) => {
			cookie[name] = "";
			
			return cookie;
		}, {}), { maxAge: 0 });
		
	}
	
	static parse = parseCookie;
	
	
	static handleClientConnect(ws, request) {
		Object.assign(ws, {
			setCookie: CookieSetter.set,
			unsetCookie: CookieSetter.unset,
			[cookieSessionIdSymbol]: null
		});
		
		if (request.headers.cookie) {
			const { sessionId = null } = parseCookie(request.headers.cookie);
			
			ws[cookieSessionIdSymbol] = sessionId;
			
			if (sessionId)
				ws.setSession(sessionId, true);
		}
		
	}
	
	static handleClientSession(ws) {
		if (ws[cookieSessionIdSymbol] !== ws.session?._id) {
			ws[cookieSessionIdSymbol] = ws.session?._id;
			
			if (ws.isOpen && ws.session) {
				const { domain, maxAge } = this.cookieSetter;
				ws.setCookie({ sessionId: ws.session._id }, { domain, maxAge });
			} else
				ws.unsetCookie([ "sessionId" ]);
		}
		
	}
	
}
