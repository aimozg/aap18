/*
 * Created by aimozg on 19.07.2022.
 */
import {ComponentChild, ComponentChildren, createRef, h} from "preact";
import {DomComponent} from "../DomComponent";
import {removeChildren, renderAppend} from "../../utils/dom";

export class ScenePanel extends DomComponent {

	private readonly refPages
	private readonly refActions
	private nextContent: ComponentChild[] = []
	private nextActions: ComponentChild[] = []
	private lastPage = createRef<HTMLDivElement>()

	constructor() {
		let refPages = createRef<HTMLDivElement>()
		let refActions = createRef<HTMLDivElement>()
		super(<div className="scene-panel">
			<div className="scene-pages" ref={refPages}></div>
			<div className="scene-actions" ref={refActions}></div>
		</div>);
		this.refPages = refPages;
		this.refActions = refActions;
	}

	clear() {
		this.nextActions = [];
		this.nextContent = [];
	}

	flush() {
		let nextPage = <div class="scene-page -current" ref={this.lastPage}>{this.nextContent}</div>;
		renderAppend(this.nextActions, this.refActions.current)
		renderAppend(nextPage, this.refPages.current);
		this.nextActions = [];
		this.nextContent = [];
	}

	flipPage(tail?:ComponentChildren) {
		if (this.lastPage.current) {
			this.lastPage.current.classList.remove('-current')
			this.lastPage.current.classList.add('-history')
			removeChildren(this.refActions.current);
			if (tail) renderAppend(tail, this.lastPage.current)
		}
	}

	addContent(content: ComponentChildren) {
		this.nextContent.push(content);
	}

	addActions(actions: ComponentChildren) {
		this.nextActions.push(actions);
	}
}
