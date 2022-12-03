import {Component, ComponentChild, h, RenderableProps} from "preact";
import {coerce} from "../../math/utils";
import {LogManager} from "../../logging/LogManager";

export interface TooltipProps {
	x: number;
	y: number;
	maxWidth: number;
	maxHeight: number;
}

export interface TooltipState {
	selfWidth?: number;
	left?: number;
	top?: number;
}

const PADDING = 0;
const RATIO = 4/3;
const MIN_WIDTH = 100;

const logger = LogManager.loggerFor("engine.ui.components.Tooltip")

export class Tooltip extends Component<TooltipProps, any> {
	constructor() {super();}

	render({children}: RenderableProps<TooltipProps>, {selfWidth,left,top}:Readonly<TooltipState>): ComponentChild {
		return <div className="tooltip" style={{
			maxWidth: selfWidth ? selfWidth : "auto",
			left: left ?? "0",
			top: top ?? "0"
		}}>{children}</div>
	}

	remove() {
		(this.base as Element)?.remove();
	}

	resize() {
		let self = this.base as HTMLElement;

		let area = self.offsetWidth * self.offsetHeight;
		if (area < 0) {
			logger.warn("Tooltip invoked for zero-area element (not in DOM?)")
			return;
		}
		let selfWidth = Math.max(MIN_WIDTH, Math.round(Math.sqrt(area/RATIO)));
		self.setAttribute("style",`max-width:${selfWidth}px`);
		let width = self.offsetWidth;
		let height = self.offsetHeight;

		let {maxWidth,maxHeight,x,y} = this.props;

		// Display below, if possible
		if (height + y + PADDING < maxHeight) {
			y += PADDING;
		} else {
			// Display above
			y = Math.max(0, y - height)
		}
		// When possible, center
		x = coerce(x - width/2, 0, maxWidth - width);

		let left = x;
		let top = y;
		this.setState({selfWidth,left,top});
	}
}
