/*
 * Created by aimozg on 17.07.2022.
 */
import {ComponentChildren, render, VNode} from "preact";

export function removeChildren(parent?:Node):void {
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

