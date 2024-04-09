import { headers } from "../common";


export class CookieSetter {
	constructor(ws, options = {}) {
		
		const {
			method = "GET",
			url = "/cookie",
			onload,
			onerror
		} = options;
		
		this.method = method;
		this.url = url;
		
		if (onload)
			this.onload = onload;
		
		if (onerror)
			this.onerror = onerror;
		
		ws.on(`message:${headers.set}`, this.#handleSet);
		
	}
	
	#handleSet = token => {
		const xhr = new XMLHttpRequest();
		
		xhr.onload = this.onload;
		xhr.onerror = this.onerror;
		
		xhr.open(this.method, `${this.url}?${token}`, true);
		
		xhr.send(null);
		
	};
	
	onload() {
		
		if (this.readyState === 4 && this.status !== 200)
			console.error("Set cookie:", this.statusText);
		
	}
	
	onerror() {
		
		console.error("Set cookie:", this.statusText);
		
	}
	
}
