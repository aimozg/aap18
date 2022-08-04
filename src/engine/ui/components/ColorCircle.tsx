/*
 * Created by aimozg on 04.08.2022.
 */
import {Component, h, RenderableProps} from "preact";

export interface ColorCircleProps {
	color: string;
	className?: string;
	clickable?: boolean;
	selected?: boolean;
	onClick?: ()=>void;
}

export class ColorCircle extends Component<ColorCircleProps, any> {
	render(props: RenderableProps<ColorCircleProps>) {
		return <div class={"color-circle "+(props.className??"")+(props.clickable?" -clickable":"")+(props.selected?" -selected":"")}
		            style={{backgroundColor:props.color}}
		            onClick={()=>props.onClick?.()}>&nbsp;</div>;
	}

}
