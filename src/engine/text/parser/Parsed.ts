export type Parsed = ParsedText | ParsedStyledText | ParsedError | ParsedMisc | ParsedGroup;

export interface ParsedText {
	type:"text";
	content:string;
}

export interface ParsedStyledText {
	type:"styledText";
	className:string;
	content:Parsed[];
}

export interface ParsedError {
	type:"error",
	content:any;
}

export interface ParsedMisc {
	type:"hr"|"br";
}

export interface ParsedGroup {
	type:"group";
	content:Parsed[];
}

export function walkParsed(e:Parsed, fn:(p:Parsed)=>void) {
	fn(e);
	if (e.type === "styledText" || e.type === "group") {
		e.content.forEach(p=>{
			walkParsed(p, fn);
		});
	}
}

export function walkParsedText(e:Parsed, fn:(p:ParsedText)=>void) {
	walkParsed(e, p=>{
		if (p.type === "text") fn(p);
	});
}
