/*
 * Created by aimozg on 04.07.2022.
 */

declare global {
    interface Number {
        /**
         * spec:
         * - [ '+' | '-' ] add sign ('+') or reserve space for '-' sign ('-')
         * - [ ',' ] add thousand separators
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

        signed(): string;
    }

    interface String {
        /**
         * Capitalize first character; if {@param skipPunctuation} is true - first non-punctuation character
         */
        capitalize(skipPunctuation?: boolean): string;
    }

    interface Array<T> {
        /**
         * In-place sort by a property {@param propName}
         * @param options Binary flags: 1: sort as case-insensitive strings, 2: sort descending
         */
        sortOn<K extends keyof T>(propName: K, options?: number): this;

        /**
         * In-place sort by a key provided by a {@param selector}. Can be called more than once per element!
         * @param options Binary flags: 1: sort as case-insensitive strings, 2: sort descending
         */
        sortWith(selector: (item: T, index: number, array: T[]) => string | number, options?: number): this;
    }
}

export const SORT_CASE_INSENSITIVE = 1;
export const SORT_DESCENDING = 2;
export const SORT_DESCENDING_CASE_INSENSITIVE = 3;

function initExtensions() {
    function formatNumber(x: number, format: string): string {
        if (!isFinite(x)) return String(x);
        let match = /^([+-]?)(,?)(\d*)(?:\.(\d+))?([dfp])(%?)$/.exec(format);
        if (!match) throw new Error("Invalid or missing number format " + format);
        let [_, sign, comma, len, dec, type, percent] = match;
        if (percent) x *= 100;
        sign ??= '';
		if (sign === '-' && x >= 0) {
			sign = ' ';
		} else if (x < 0) {
            sign = '-';
            x = -x;
        }
        if (type === 'd') dec = '0';

        let s: string;
        switch (type) {
            case 'd':
            case 'f':
                s = x.toFixed(+dec);
                break;
            case 'p':
                s = x.toPrecision(+dec);
                break;
            default:
                s = "" + x;
        }
        // Pad with zeros:  "-000,001,234"
        // Pad with spaces: "      -1,234"
        if (!comma && len && len[0] === '0') {
            let nlen = +len - sign.length;
            s = s.padStart(nlen, '0');
        }
        if (comma) {
            let dotpos = s.indexOf('.');
            let int = dotpos >= 0 ? s.substring(0, dotpos) : s;
            let frac = dotpos >= 0 ? s.substring(dotpos) : '';
            let n = int.length;
            let cint = '';
            let i = n % 3;
            if (i) cint = s.substring(0, i);
            for (; i < n; i += 3) {
                if (cint) cint += ',';
                cint += s.substring(i, i + 3);
            }
			if (len && len[0] === '0') {
				let nlen = +len - sign.length - frac.length;
				while (cint.length < nlen) {
					if ((cint.length-3)%4 === 0) cint = ','+cint;
					cint = '0'+cint;
				}
			}
			s = cint + frac;
		}
        s = sign + s;
        if (len && len[0] !== '0') {
            s = s.padStart(+len, ' ');
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

    Object.defineProperty(Number.prototype, "signed", {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (this: number): string {
            return (isFinite(this) && this >= 0) ? "+" + this : "" + this;
        }
    });

    Object.defineProperty(String.prototype, "capitalize", {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function (this: string, skipPunctuation: boolean = true): string {
            if (!this) return this;
            if (skipPunctuation) {
                return this.replace(/^\W*\w/, s => s.toUpperCase())
            } else {
                let c = this[0].toUpperCase()
                if (c === this[0]) return this;
                return c + this.slice(1);
            }
        }
    });

    Object.defineProperty(Array.prototype, "sortWith", {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function <T>(this: T[], selector: (item: T) => string | number, options?: number): T[] {
            let compareFn: (a: T, b: T) => number;
            switch (options) {
                case SORT_DESCENDING_CASE_INSENSITIVE:
                    compareFn = (a, b) => String(b).toUpperCase().localeCompare(String(a).toUpperCase())
                    break;
                case SORT_DESCENDING:
                    compareFn = (a, b) =>
                        selector(a) < selector(b) ? 1 : selector(a) > selector(b) ? -1 : 0
                    break;
                case SORT_CASE_INSENSITIVE:
                    compareFn = (a, b) => String(a).toUpperCase().localeCompare(String(b).toUpperCase())
                    break;
                case 0:
                default:
                    compareFn = (a, b) =>
                        selector(a) > selector(b) ? 1 : selector(a) < selector(b) ? -1 : 0
            }
            this.sort(compareFn);
            return this;
        }
    });

    Object.defineProperty(Array.prototype, "sortOn", {
        enumerable: false,
        writable: false,
        configurable: false,
        value: function <T, K extends keyof T>(this: T[], propName: K, options?: number): T[] {
            this.sortWith(item => item[propName] as unknown as (string | number), options)
            return this;
        }
    });
}

initExtensions();
