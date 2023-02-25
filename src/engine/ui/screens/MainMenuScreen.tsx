import {AbstractScreen} from "../AbstractScreen";
import {h, VNode} from "preact";
import {Button} from "../components/Button";

export class MainMenuScreen extends AbstractScreen {
	constructor() {
		super();
	}

	async onResumeGameClick() {
		await this.game.screenManager.closeTop('fade');
		await this.game.gameController.loadAutosave();
	}

	async onNewGameClick() {
		let started = await this.game.gameController.startNewGame();
		if (!started) {
			await this.game.screenManager.addOnTop(this, 'fade');
		}
	}

	node(): VNode {
		return <div class="text-center text-intense screen-main-menu">
			<div class="text-xxxl mt-lg-8 mt-4">{this.game.info.title}</div>
			<div class="">{this.game.info.subtitle}</div>
			<div class="text-s mb-8">{this.game.info.version}</div>

			<div class="d-flex flex-column ai-center gap-4">
				<Button label="Resume Game"
				        disabled={!this.game.saveManager.isRecentSaveAvailable()}
				        className="-big"
				        onClick={()=>this.onResumeGameClick()}/>
				<Button label="New Game"
				        className="-big"
				        onClick={()=>this.onNewGameClick()}/>
			</div>
		</div>
	}
}
