import {Component, ComponentChild, ComponentChildren, createRef, h, RenderableProps} from "preact";
import {Game} from "../../Game";

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
		Game.instance.screenManager.showTooltipAt(this.ref.current as HTMLElement, this.props.tooltip)
	}
	hideTooltip() {
		Game.instance.screenManager.hideTooltip();
	}

	componentWillUnmount() {
		Game.instance.screenManager.hideTooltip();
	}

	render({className,inline,children}: RenderableProps<WithTooltipProps>): ComponentChild {
		Game.instance.screenManager.hideTooltip();
		return <div
			ref={this.ref}
			class={className}
			style={inline?"display:inline-block":"display:block"}
			onMouseEnter={()=>this.showTooltip()}
			onMouseLeave={()=>this.hideTooltip()}
		>{children}</div>
	}

}
