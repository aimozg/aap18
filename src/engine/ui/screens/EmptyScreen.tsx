import {AbstractScreen} from "../AbstractScreen";
import {Fragment, h, VNode} from "preact";

export class EmptyScreen extends AbstractScreen {

	constructor() {
		super();
	}

	node(): VNode {
		return <Fragment></Fragment>;
	}
}
