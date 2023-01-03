import {Component, ComponentChild, h, RenderableProps} from "preact";

export interface RadioProps<T> {
	name: string;
	variable: T;
	value: T;
	disabled?: boolean;
	onChange?: (value:T)=>void;
}

export class Radio<T> extends Component<RadioProps<T>, any> {

	constructor(props: RadioProps<T>, context: any) {
		super(props, context);
	}

	render({name,variable,value,disabled,children,onChange}: RenderableProps<RadioProps<T>>): ComponentChild {
		return <label><input type="radio"
		                     name={name}
		                     checked={variable === value}
		                     disabled={disabled??false}
		                     onChange={()=>onChange?.(value)}/>{children}</label>
	}

}
