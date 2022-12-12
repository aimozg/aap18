import {DomComponent} from "../DomComponent";
import {ComponentChildren, createRef, h} from "preact";
import {removeChildren, renderAppend} from "../../utils/dom";

export class TextPanel extends DomComponent {
	private readonly refPages;
	private readonly refActions;
	private currentPage = createRef<HTMLDivElement>()

	constructor(
		private pageClassName: string = "text-page"
	) {
		let refPages = createRef<HTMLDivElement>()
		let refActions = createRef<HTMLDivElement>()
		super(
			<div class="text-panel">
				<div class="text-pages" ref={refPages}></div>
				<div class="scene-actions" ref={refActions}></div>
			</div>
		);
		this.refPages = refPages;
		this.refActions = refActions;
		this.flipPage();
	}

	clear() {
		removeChildren(this.refPages.current);
	}

	flush(){}

	flipPage(tail?: ComponentChildren) {
		if (this.currentPage.current) {
			this.currentPage.current.classList.remove('-current')
			this.currentPage.current.classList.add('-history')
			if (tail) renderAppend(tail, this.currentPage.current)
		}
		renderAppend(<div class={this.pageClassName + " -current"} ref={this.currentPage}></div>, this.refPages.current!);
		removeChildren(this.refActions.current!)
	}
	private autoScroll<T>(body:()=>T):T {
		let oldHeight = this.node.scrollHeight;
		let t = body();
		let newHeight = this.node.scrollHeight;
		this.node.scrollBy({top:(newHeight - oldHeight)})
		//this.node.scrollTop += newHeight - oldHeight;
		return t;
	}
	scrollDown() {
		this.node.scrollTo({top:this.node.scrollHeight})
		//this.node.scrollTop =
	}

	append(content: ComponentChildren) {
		this.autoScroll(()=>{
			renderAppend(content, this.currentPage.current!);
		});
	}

	addActions(actions: ComponentChildren) {
		this.autoScroll(()=> {
			renderAppend(actions, this.refActions.current!);
		});
	}

	newChapter(content: ComponentChildren, extraClass:string="") {
		this.scrollDown();
		this.append(<div className={"scene-delimiter "+extraClass}>{content}</div>)
	}
}
