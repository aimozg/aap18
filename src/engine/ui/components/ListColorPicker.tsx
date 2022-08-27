import {Component, ComponentChild, h, RenderableProps} from "preact";
import {Button} from "./Button";
import {ColorCircle} from "./ColorCircle";
import {Color} from "../../objects/Color";

export interface ListColorPickerProps {
	colors: Color[];
	startValue: Color | null;
	onChange: (value: Color) => void;
}

export interface ListColorPickerState {
	value: Color | null;
}

export class ListColorPicker extends Component<ListColorPickerProps, ListColorPickerState> {
	constructor(props: ListColorPickerProps) {
		super(props);
		this.setState({value: props.startValue})
	}
	index() {
		return this.state.value ? this.props.colors.indexOf(this.state.value) : -1;
	}
	prev() {
		let i = this.index();
		if (i === -1) this.select(this.props.colors[0]);
		else this.select(this.props.colors[(i - 1 + this.props.colors.length) % this.props.colors.length]);
	}
	next() {
		let i = this.index();
		if (i === -1) this.select(this.props.colors[0]);
		else this.select(this.props.colors[(i + 1) % this.props.colors.length]);
	}
	select(color: Color) {
		this.setState({value: color});
		this.props.onChange(color);
	}
	render(props: RenderableProps<ListColorPickerProps>, state: Readonly<ListColorPickerState>): ComponentChild {
		return <div class="list-color-picker">
			<Button className="--prev" label="<" onClick={() => this.prev()}></Button>
			<div className="--selection">
				{state.value && <ColorCircle className="mx-2" color={state.value.rgb}/>}
				{state?.value?.name}
			</div>
			<Button className="--next" label=">" onClick={() => this.next()}></Button>
			<div className="--colors">
				{props.colors.map(color =>
					<ColorCircle color={color.rgb}
					             selected={color === state.value}
					             clickable
					             onClick={() => this.select(color)}/>)}
			</div>
		</div>;
	}

}
