/*
 * Created by aimozg on 04.07.2022.
 */

declare global {
	interface Number {
		/**
		 * spec:
		 * - [ '+' ] add sign
		 * - [ ['0'] <length> ] total length (without sign), padded with ' ' or '0'
		 * - [ '.' <decimals> ] number of decimals or desired precision
		 * - ( 'd' | 'f' | 'p' ) integer, float, or precision
		 * - [ '%' ] multiply by 100, won't add '%' sign
		 * @example
		 * (3.14).format('+.3f') => "+3.140"
		 * (1234.5678).format('.5p') => "1234.6"
		 * (-0.15).format('+.1f%') => "-15.0"
		 */
		format(spec: string): string;
	}
	interface String {
		capitalize():string;
		capitalize(skipPunctuation:boolean):string;
	}
}

export function initExtensions() {
	function formatNumber(x:number, format:string):string {
		if (!isFinite(x)) return String(x);
		if (x < 0) return "-"+formatNumber(x,format);
		let match = /^([+]?)(\d*)(?:\.(\d+))?([dfp])(%?)$/.exec(format);
		if (!match) throw new Error("Invalid or missing number format "+format);
		let [_,sign,len,dec,type,percent] = match;
		if (percent) x *= 100;
		sign ??= '';
		if (type === 'd') dec = '0';

		let s:string;
		switch (type) {
			case 'd':
			case 'f':
				s = x.toFixed(+dec);
				break;
			case 'p':
				s = x.toPrecision(+dec);
		}
		if (len) {
			let nlen = +len;
			if (len[0] === '0') {
				nlen--;
				s = s.padStart(nlen, '0');
				s = sign+s;
			} else {
				s = sign+s;
				s = s.padStart(nlen, ' ');
			}
		} else {
			s = sign+s;
		}
		return s;
	}

	Object.defineProperty(Number.prototype, "format", {
		enumerable: false,
		writable: false,
		configurable: false,
		value: function (this: number, format: string): string {
			return formatNumber(this, format);
		}
	});

	Object.defineProperty(String.prototype, "capitalize", {
		enumerable: false,
		writable: false,
		configurable: false,
		value: function(this:string, skipPunctuation:boolean=true):string {
			if (!this) return this;
			if (skipPunctuation) {
				return this.replace(/^\W*\w/, s=>s.toUpperCase())
			} else {
				let c = this[0].toUpperCase()
				if (c === this[0]) return this;
				return c + this.slice(1);
			}
		}
	})
}
