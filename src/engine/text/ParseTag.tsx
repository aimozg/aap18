import {Component, ComponentChild, h, RenderableProps} from "preact";
import {Parser} from "./parser/Parser";
import {walkVNode} from "../utils/vnode";
import {Creature} from "../objects/Creature";

export interface ParseTagProps {
	parser?: Parser;
	self?: Creature;
	select?: Creature;
}

export class Parse extends Component<ParseTagProps, any> {
	render(props: RenderableProps<ParseTagProps>): ComponentChild {
		let parser = props.parser ?? new Parser(props.self);
		if (props.select) parser.select(props.select);
		return walkVNode(props.children, (node,fn)=>{
			if (typeof node === 'string') {
				fn.replace = parser.print(node)
			}
		})
	}
}
