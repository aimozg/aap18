import {PlayerMenuScreen} from "../PlayerMenuScreen";
import {ComponentChildren, VNode} from "preact";

export abstract class AbstractPlayerScreenTab {
// noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
	constructor(public readonly screen:PlayerMenuScreen) {}
	protected readonly player = this.screen.player;
	protected readonly canLevelUp = this.screen.canLevelUp;

	abstract readonly label:ComponentChildren;
	abstract node(): VNode;
}
