import {Component, ComponentChild, ComponentChildren, createRef, h, RenderableProps} from "preact";
import {TooltipManager} from "./Tooltip";

export interface WithTooltipProps {
	className?: string;
	/* TODO make it work */
	minWidth?: number;
	inline?: boolean;
	tooltip: ComponentChildren;
}

export class WithTooltip extends Component<WithTooltipProps, any>{
	ref = createRef()
	showTooltip() {
		if (!this.ref.current) return;
		TooltipManager.showTooltip({origin: this.ref.current as HTMLElement, content: this.props.tooltip});
	}
	hideTooltip() {
		TooltipManager.hideTooltip();
	}

	componentWillUnmount() {
		TooltipManager.hideTooltip();
	}

	render({className,inline,children}: RenderableProps<WithTooltipProps>): ComponentChild {
		TooltipManager.hideTooltip();
		return <div
			ref={this.ref}
			class={className}
			style={inline?"display:inline-block":"display:block"}
			onMouseEnter={()=>this.showTooltip()}
			onMouseLeave={()=>this.hideTooltip()}
		>{children}</div>
	}

}
