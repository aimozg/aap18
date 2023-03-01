/*
 * Created by aimozg on 30.07.2022.
 */
import {DomComponent} from "../DomComponent";
import {createRef, h, RefObject} from "preact";
import {BattleContext} from "../../combat/BattleContext";
import {EmptyGlyphSource, GlyphCanvas} from "../components/GlyphCanvas";

export class BattlePanel extends DomComponent {
	private readonly refContainer: RefObject<HTMLDivElement>
	private readonly canvas:GlyphCanvas
	constructor(public context: BattleContext) {
		let refContainer = createRef<HTMLDivElement>()
		super(
			<div className="combat-panel d-flex flex-grow-1 jc-stretch" ref={refContainer}>
			</div>
		);
		this.refContainer = refContainer;
		this.canvas = new GlyphCanvas(EmptyGlyphSource);
	}
	init() {
		this.canvas.source = this.context.grid;
	}
	animationFrame(dt:number, time:number):void{
		this.context.grid.animationFrame(dt);
		this.update();
	}
	update(){
		if (this.canvas.element.parentElement !== this.refContainer.current)  {
			this.refContainer.current?.append(this.canvas.element);
			this.canvas.autoCenter();
		}
		// TODO instead, zoomOutToShowGrid on canvas resize event
		if (this.canvas.stretchToParentSize()) {
			this.canvas.zoomOutToShowGrid();
		}
		this.canvas.render();
	}
}

