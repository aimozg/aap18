import {Component, ComponentChild, ComponentChildren, h, RenderableProps} from "preact";
import {Button} from "./Button";

export interface ButtonMenuItem<V> {
	label: ComponentChildren;
	value: V;
	disabled?: boolean;
	hotkey?: string;
	className?: string;
}

export interface ButtonMenuProps<V> {
	items: ButtonMenuItem<V>[];
	selected?: V|null;
	onChange?: (value: V) => void;
	className?: string;
}

export interface ButtonMenuState {

}

export class ButtonMenu<V> extends Component<ButtonMenuProps<V>, ButtonMenuState> {

	constructor(props: ButtonMenuProps<V>, context: any) {
		super(props, context);
	}

	private click(e: MouseEvent, item: any) {
		(e.target as HTMLElement).blur();
		this.props.onChange?.(item);
	}

	render(props: RenderableProps<ButtonMenuProps<V>>, state: Readonly<ButtonMenuState>, context: any): ComponentChild {
		return props.items.map(item =>
			<Button label={item.label}
			        className={
				        (item.className ?? '') + ' ' +
				        (props.className ?? '') + ' ' +
				        (props.selected === item.value ? '-selected-item' : '')}
			        hotkey={item.hotkey}
			        disabled={item.disabled}
			        onClick={(e) => this.click(e, item.value)}/>
		)
	}

}
