export function parseCookie(cookie) {
	return cookie ? cookie.split(/;\s*/).reduce((object, keyEqValue) => {
		const [ key, value ] = keyEqValue.split(/=/);
		
		try {
			object[key] = JSON.parse(value);
		} catch {
			object[key] = value;
		}
		
		return object;
	}, {}) : {};
}
