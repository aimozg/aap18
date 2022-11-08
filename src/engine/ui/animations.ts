/*
 * Created by aimozg on 25.07.2022.
 */

import {shifty, tween} from "shifty";
import tweenConfig = shifty.tweenConfig;

export type TransitionSpec = {
	add?: (e: HTMLElement) => tweenConfig,
	remove?: (e: HTMLElement) => tweenConfig,
}

export const AnimationOptions = {
	slow: 1000,
	normal: 500,
	fast: 333,
	vfast: 167,
}

function stylePair(from: any, to: any, duration: number): TransitionSpec {
	function styleRenderer(element: HTMLElement) {
		return (state:any)=>{
			Object.assign(element.style, state)
		}
	}
	return {
		add: (element: HTMLElement) => ({
			from: from,
			to: to,
			start: styleRenderer(element),
			duration: duration/2,
			render: styleRenderer(element),
		}),
		remove: (element: HTMLElement) => ({
			from: to,
			to: from,
			start: styleRenderer(element),
			duration: duration/2,
			render: styleRenderer(element),
		}),
	}
}

export const TransitionAnimations = {
	"fade-slow": stylePair({opacity: 0}, {opacity: 1}, AnimationOptions.slow),
	"fade": stylePair({opacity: 0}, {opacity: 1}, AnimationOptions.normal),
	"fade-fast": stylePair({opacity: 0}, {opacity: 1}, AnimationOptions.fast),
	"fade-vfast": stylePair({opacity: 0}, {opacity: 1}, AnimationOptions.vfast),
}

export type TransitionAnimationName = keyof typeof TransitionAnimations;

export function animateTransition(element: HTMLElement, transition: TransitionAnimationName | undefined, type: 'add' | 'remove'): PromiseLike<any> {
	if (!element || !transition) return Promise.resolve();
	let t = TransitionAnimations[transition]?.[type]?.(element);
	if (!t) return Promise.resolve();
	return tween(t) as PromiseLike<any>
}
