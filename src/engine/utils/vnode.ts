/*
 * Created by aimozg on 20.09.2022.
 */

import {ComponentChild, ComponentChildren, VNode} from "preact";

export interface VNodeIterator {
	skip?:boolean;
	remove?:boolean;
	replace?:ComponentChildren;
}

function walkVNodeList(nodes:ComponentChild[], callback:(node:any, fn:VNodeIterator)=>void):ComponentChild[] {
	return nodes.map(node => {
		let fn: VNodeIterator = {}
		callback(node, fn)
		if (fn.remove) {
			return null
		} else if ('replace' in fn) {
			return fn.replace
		} else if (fn.skip) {
			return node
		} else {
			return walkVNode(node, callback)
		}
	})
}

export function walkVNode(node:ComponentChildren, callback:(node:any, fn:VNodeIterator)=>void):ComponentChildren {
	if (node === undefined || node === null || node === '') {
		return node
	}
	if (typeof node === 'object') {
		if (Array.isArray(node)) {
			return walkVNodeList(node, callback)
		}
		let fn: VNodeIterator = {}
		callback(node, fn)
		if (fn.remove) {
			return null
		} else if ('replace' in fn) {
			return fn.replace
		} else if (fn.skip) {
			return node
		} else {
			let vnode = node as VNode<any>;
			vnode.props.children = walkVNode(vnode.props.children, callback)
			return vnode
		}
	}
	let fn: VNodeIterator = {}
	callback(node, fn)
	if (fn.remove) {
		return null
	} else if ('replace' in fn) {
		return fn.replace
	} else {
		return node
	}
}
