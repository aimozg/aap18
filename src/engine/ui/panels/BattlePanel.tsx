/*
 * Created by aimozg on 30.07.2022.
 */
import {DomComponent} from "../DomComponent";
import {createRef, h} from "preact";
import {BattleContext} from "../../combat/BattleContext";
import {GlyphCanvas} from "../components/GlyphCanvas";
import {ScreenType} from "../ScreenManager";
import {Game} from "../../Game";

let CanvasConfigs: {
	[index in ScreenType]:{
		font: string;
		cellWidth: number;
		cellHeight: number;
	}
} = {
	desktop: {
		font: "32px monospace",
		cellWidth: 36,
		cellHeight: 36
	},
	tablet: {
		font: "24px monospace",
		cellWidth: 27,
		cellHeight: 27
	},
	phone: {
		font: "16px monospace",
		cellWidth: 18,
		cellHeight: 18
	},
}

export class BattlePanel extends DomComponent {
	private readonly refMain
	private readonly canvas:GlyphCanvas
	constructor(public context: BattleContext) {
		let refMain = createRef<HTMLCanvasElement>()
		super(
			<div className="combat-panel d-flex flex-grow-1 jc-stretch">
				<canvas ref={refMain}/>
			</div>
		);
		this.refMain = refMain;
		this.canvas = new GlyphCanvas(refMain.current!.getContext("2d")!!)
	}
	init() {
		this.canvas.visibleCols = this.context.grid.width;
		this.canvas.visibleRows = this.context.grid.height;
		let sz = CanvasConfigs[Game.instance.screenManager.screenType];
		this.canvas.font = sz.font;
		this.canvas.cellWidth = sz.cellWidth;
		this.canvas.cellHeight = sz.cellHeight;
	}
	animationFrame(dt:number, time:number):void{
		this.context.grid.animationFrame(dt);
		this.canvas.fitToParentSize();
		this.canvas.render(this.context.grid);
	}
	update(){
		this.canvas.fitToParentSize();
		this.canvas.render(this.context.grid);
	}
}

