/*
 * Created by aimozg on 19.07.2022.
 */
import {ComponentChild, ComponentChildren, createRef, h} from "preact";
import {DomComponent} from "../DomComponent";
import {removeChildren, renderAppend} from "../../utils/dom";
import {TextPages} from "./TextPages";

// TODO inheritance instead of composition OR extract "ITextPages" interface
export class ScenePanel extends DomComponent {

	readonly pages;
	private readonly refActions
	private nextActions: ComponentChild[] = []

	constructor() {
		let pages = new TextPages();
		let refActions = createRef<HTMLDivElement>()
		super(<div className="scene-panel">
			{pages.astsx}
			<div className="scene-actions" ref={refActions}></div>
		</div>);
		this.pages = pages;
		this.refActions = refActions;
	}

	clear() {
		this.nextActions = [];
		this.pages.clear();
	}

	flush() {
		this.pages.flush();
		removeChildren(this.refActions.current!);
		renderAppend(this.nextActions, this.refActions.current!)
		this.nextActions = [];
	}

	flipPage(tail?:ComponentChildren) {
		this.pages.flipPage(tail);
		removeChildren(this.refActions.current!);
	}

	addContent(content: ComponentChildren) {
		this.pages.addContent(content);
	}

	addActions(actions: ComponentChildren) {
		this.nextActions.push(actions);
	}
}
