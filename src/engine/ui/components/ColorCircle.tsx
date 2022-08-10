/*
 * Created by aimozg on 04.08.2022.
 */
import {Component, h, RenderableProps} from "preact";
import {CSSProperties} from "preact/compat";
import {stripedBackground} from "../../utils/css";

export interface ColorCircleProps {
	color: string;
	color2?: string;
	className?: string;
	clickable?: boolean;
	selected?: boolean;
	onClick?: () => void;
}

export class ColorCircle extends Component<ColorCircleProps, any> {
	render(props: RenderableProps<ColorCircleProps>) {
		let style: CSSProperties;
		if (!props.color2) {
			style = {backgroundColor: props.color};
		} else {
			style = {
				background: stripedBackground(props.color, props.color2, 0.5, -45)
			}
		}
		return <div
			class={"color-circle " + (props.className ?? "") + (props.clickable ? " -clickable" : "") + (props.selected ? " -selected" : "")}
			style={style}
			onClick={() => props.onClick?.()}>&nbsp;</div>;
	}

}
