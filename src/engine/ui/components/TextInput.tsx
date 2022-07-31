import {Component, ComponentChild, h, RenderableProps} from "preact";

export interface TextInputProps {
	className?: string;
	disabled?: boolean;
	value?: string;
	onChange?: (value:string) => void;
}

export interface TextInputState {

}

export class TextInput extends Component<TextInputProps, TextInputState> {

	constructor(props: TextInputProps, context: any) {
		super(props, context);
	}
	private onInput(e:InputEvent) {
		if (this.props.onChange) this.props.onChange((e.target as HTMLInputElement).value);
	}
	private onChange(e:InputEvent) {
		this.onInput(e);
	}
	render(props: RenderableProps<TextInputProps> | undefined, state: Readonly<TextInputState> | undefined, context: any): ComponentChild {
		return <input
			type="text"
			class={props.className}
			disabled={!!props.disabled}
			value={props.value}
			onInput={this.onInput.bind(this)}
			onChange={this.onChange.bind(this)}
		/>
	}


}
