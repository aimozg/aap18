/*
 * Created by aimozg on 30.07.2022.
 */
import {DomComponent} from "../DomComponent";
import {createRef, h} from "preact";
import {BattleContext} from "../../combat/BattleContext";
import {GlyphCanvas} from "../components/GlyphCanvas";

export class BattlePanel extends DomComponent {
	private readonly refMain
	private readonly canvas:GlyphCanvas
	constructor(public context: BattleContext) {
		let refMain = createRef<HTMLCanvasElement>()
		super(
			<div className="combat-panel d-flex flex-grow-1 jc-stretch">
				<canvas className="flex-grow-1" ref={refMain}/>
			</div>
		);
		this.refMain = refMain;
		this.canvas = new GlyphCanvas(refMain.current!!.getContext("2d")!!, "fit")
	}
	init() {
		this.canvas.windowWidth = this.context.grid.width;
		this.canvas.windowHeight = this.context.grid.height;
	}
	animationFrame(dt:number, time:number):void{
		this.canvas.render(this.context.grid);
	}
	update(){
		this.canvas.render(this.context.grid);
	}
}

