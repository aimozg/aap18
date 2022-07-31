import {h, VNode} from "preact";
import {render1} from "../utils/dom";
import {AppendNode} from "./AppendNode";

export abstract class DomComponent {
	protected constructor(wireframe: VNode) {
		this.node = render1(wireframe)
	}
	protected readonly node: Element
	get astsx(): VNode { return <AppendNode child={this.node}/> }
}
