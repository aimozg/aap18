/*
 * Created by aimozg on 17.07.2022.
 */
import {ComponentChildren, render, VNode} from "preact";

export function removeChildren(parent:Node|null|undefined):void {
	if (!parent) return;
	let c;
	while ((c = parent.firstChild)) parent.removeChild(c);
}

export function moveChildren(source:Node, dest:Node, insertAfter:Node|null=null):void {
	if (!source || !dest || source === dest) return;
	let c;
	if (insertAfter) {
		insertAfter = insertAfter.nextSibling;
		while ((c = source.firstChild)) dest.insertBefore(c, insertAfter);
	} else{
		while ((c = source.firstChild)) dest.appendChild(c);
	}
}

export function renderAppend(e:ComponentChildren, container:Element|Document|ShadowRoot|DocumentFragment):void {
	let tmp = document.createDocumentFragment();
	render(e, tmp);
	container.appendChild(tmp);
}

export function render1<T extends Node>(v:VNode):T {
	let tmp = document.createDocumentFragment();
	render(v, tmp);
	return tmp.firstChild as Node as T
}

export interface ComputedBoxes {
	padding: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	};
	margin: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	};
	border: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	};
	content: {
		width: number;
		height: number;
	};
	boxSizing: 'border-box'|'content-box'|string;
}
export function getComputedBoxes(e:Element):ComputedBoxes {
	const style = getComputedStyle(e);
	let cw = e.clientWidth, ch = e.clientHeight;
	let padding = {
		left: parseFloat(style.paddingLeft),
		right: parseFloat(style.paddingRight),
		top: parseFloat(style.paddingTop),
		bottom: parseFloat(style.paddingBottom),
	}
	let margin = {
		left: parseFloat(style.marginLeft),
		right: parseFloat(style.marginRight),
		top: parseFloat(style.marginTop),
		bottom: parseFloat(style.marginBottom),
	}
	let border = {
		left: parseFloat(style.borderLeftWidth),
		right: parseFloat(style.borderRightWidth),
		top: parseFloat(style.borderTopWidth),
		bottom: parseFloat(style.borderBottomWidth),
	}
	let boxSizing = style.boxSizing;
	return {
		padding,margin,border,boxSizing,
		content: {
			width: cw - padding.left - padding.right,
			height: ch - padding.top - padding.bottom
		}
	}
}
