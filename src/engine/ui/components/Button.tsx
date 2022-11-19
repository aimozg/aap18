import {Component, ComponentChild, ComponentChildren, h, RenderableProps} from "preact";
import {KeyCodes} from "../KeyCodes";

export interface ButtonProps {
	label?: string;
	action?: UIAction;
	className?: string;
	onClick?: (e: MouseEvent) => void;
	disabled?: boolean;
	hold?: boolean;
	default?: boolean;
	hotkey?: string|null;
}

export interface ButtonState {

}

export interface UIAction {
	hotkey?: string;
	hotkeys?: string[];
	label?: string|ComponentChildren;
	disabled?: boolean|(()=>boolean);
	callback: ()=>void;
}

export function uiActionEnabled(a:UIAction):boolean {
	if (typeof a.disabled === 'boolean') return !a.disabled;
	if (typeof a.disabled === 'function') return !a.disabled();
	return true;
}

export function execUIAction(event:KeyboardEvent, actions:UIAction[]):boolean {
	let hk = KeyCodes.eventToHkString(event);
	for (let action of actions) {
		if (!uiActionEnabled(action)) continue;
		if (action.hotkey === hk || action.hotkeys?.includes(hk)) {
			action.callback();
			return true;
		}
	}
	return false;
}

export class Button extends Component<ButtonProps, ButtonState> {

	private onClick(ev: MouseEvent) {
		ev.preventDefault();
		if (this.props.onClick) this.props.onClick(ev);
		if (this.props.action?.callback) this.props.action?.callback();
	}
	private timeout:number = 0;
	private interval:number = 0;
	private onMouseDown(ev: MouseEvent) {
		ev.preventDefault();
		this.timeout = window.setTimeout(()=>{
			this.interval = window.setInterval(()=>{
				if (this.props.onClick && !this.props.disabled) {
					this.props.onClick(ev);
				} else {
					this.clear();
				}
			}, 100);
		}, 500);
	}
	private onMouseLeave(ev: MouseEvent) {
		this.clear();
	}
	private onMouseUp(ev: MouseEvent) {
		ev.preventDefault();
		this.clear();
	}
	private clear() {
		if (this.timeout) window.clearTimeout(this.timeout);
		if (this.interval) window.clearInterval(this.interval);
		this.timeout = 0;
		this.interval = 0;
	}

	componentWillUnmount() {
		this.clear();
	}

	render(props: RenderableProps<ButtonProps>, state: Readonly<ButtonState>, context: any): ComponentChild {
		let hotkey = props.hotkey ?? props.action?.hotkey ?? props.action?.hotkeys?.[0];
		let disabled = props.disabled ?? (props.action && !uiActionEnabled(props.action));
		let hk = hotkey ? <span class="--hk">{KeyCodes.hkLongToShort(hotkey)}</span> : null
		return <button
			type="button"
			class={props.className}
			disabled={!!disabled}
			onMouseDown={props.hold?this.onMouseDown.bind(this):undefined}
			onMouseUp={props.hold?this.onMouseUp.bind(this):undefined}
			onMouseLeave={props.hold?this.onMouseLeave.bind(this):undefined}
			onClick={this.onClick.bind(this)}>{hk}{props.children}{props.label??props.action?.label}</button>
	}

}
