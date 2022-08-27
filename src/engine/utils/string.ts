/*
 * Created by aimozg on 05.07.2022.
 */

export type AdjustCaseMode = "keep" | "capitalize" | "uppercase";

export function adjustCaseMode(reference: string): AdjustCaseMode {
	if (reference === reference.toUpperCase()) return "uppercase";
	if (reference === reference.capitalize()) return "capitalize"
	return "keep"
}

export function adjustCase(reference: string, content: string): string {
	switch (adjustCaseMode(reference)) {
		case "capitalize":
			return content.capitalize();
		case "uppercase":
			return content.toUpperCase();
		case "keep":
		default:
			return content;
	}
}

const knownEntities = new Map<string, string>();
const tmpEl = document.createElement("span")
const entityRex = /^&(?:\w+|#x[a-fA-F\d]+|#\d+);$/

export function parseXmlEntity(entity: string): string {
	if (knownEntities.has(entity)) return knownEntities.get(entity)!;
	if (!entityRex.test(entity)) return entity;
	tmpEl.innerHTML = entity;
	let value = tmpEl.textContent!;
	knownEntities.set(entity, value);
	return value;
}

/**
 * Replaces in {@param pattern} `"{part}"` with parts from {@param substitutions}
 */
export function formatPatternNames(
	pattern: string,
	substitutions: ((s: string) => string)
		| Record<string, string | (() => string)>
): string {
	let replacer: (part: string) => string;
	if (typeof substitutions === 'function') {
		replacer = substitutions;
	} else {
		replacer = part => {
			let v = substitutions[part];
			return (typeof v === 'function') ? v() : String(v);
		}
	}
	return pattern.replace(/\{([\w_]+)}/g, (match, s) => replacer(s) ?? match)
}
