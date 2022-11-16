import {Component, ComponentChild, h, RenderableProps} from "preact";
import {CSSProperties} from "preact/compat";
import {coerce} from "../../math/utils";

export interface BarProps {
	fg?: string;
	fgs?: string[];
	className?: string;
	classes?: string[];
	bg?: string;
	height?: number | string;
	value?: number;
	values?: number[];
	print?: boolean;
	format?: string;
	min?: number;
	max?: number;
}

export class Bar extends Component<BarProps, {}> {
	render(props: RenderableProps<BarProps>): ComponentChild {
		let style: CSSProperties = {
			background: props.bg,
			height: props.height
		}
		let fgs = props.fgs ?? [props.fg];
		let values = props.values ?? [props.value!];
		let classes = props.classes ?? [];
		let min = props.min ?? 0;
		let max = props.max ?? 1;
		let children = props.children;
		if (props.print) {
			children = [values[0].format(props.format ?? ",d"),props.children];
		}
		return <div style={style} class={"bar " + (props.className ?? "")}>
			{values.map((x, i) =>
				<div style={{
					left: 0,
					background: fgs[i],
					width: (isNaN(+x) || x <= min ? 0 : x >= max ? 100 :
						coerce((x - min) / max * 100, 1, 99)) + '%'
				}} className={"bar-value " + (classes[i] ?? "")}/>
			)}
			{children !== undefined && <div class="bar-content">{children}</div>}
		</div>
	}

}
