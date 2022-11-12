import {DomComponent} from "../DomComponent";
import {ComponentChild, ComponentChildren, createRef, h} from "preact";
import {removeChildren, renderAppend} from "../../utils/dom";

export class TextPages extends DomComponent {
	private nextContent: ComponentChild[] = []
	private readonly refPages;
	private lastPage = createRef<HTMLDivElement>()

	constructor(
		className: string = "text-pages",
		private pageClassName: string = "text-page"
	) {
		let refPages = createRef<HTMLDivElement>()
		super(<div className={className} ref={refPages}></div>);
		this.refPages = refPages;
	}

	clear() {
		removeChildren(this.refPages.current);
		this.nextContent = [];
	}

	flush() {
		let nextPage = <div class={this.pageClassName+" -current"} ref={this.lastPage}>{this.nextContent}</div>;
		renderAppend(nextPage, this.refPages.current!);
		this.nextContent = [];
	}

	flipPage(tail?: ComponentChildren) {
		if (this.lastPage.current) {
			this.lastPage.current.classList.remove('-current')
			this.lastPage.current.classList.add('-history')
			if (tail) renderAppend(tail, this.lastPage.current)
		}
	}

	addContent(content: ComponentChildren) {
		this.nextContent.push(content);
	}

}