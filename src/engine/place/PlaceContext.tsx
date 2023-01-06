import {Place} from "./Place";
import {InternalChoiceData, SceneContext} from "../scene/SceneContext";
import {GameScreenLayout} from "../ui/screens/GameScreen";
import {PlaceSidebar} from "../ui/panels/PlaceSidebar";
import {createRef, h} from "preact";
import {PlayerMenuScreen} from "../ui/screens/PlayerMenuScreen";
import {TextOutput} from "../text/output/TextOutput";

export class PlaceContext extends SceneContext {
	private readonly sidebarRef = createRef<PlaceSidebar>();

	constructor(public place: Place) {
		super(place.sceneId, place.scene.sceneFn, new TextOutput());
	}

	async display(): Promise<void> {
		this.sidebarRef.current?.enable();
		this.sidebarRef.current?.forceUpdate();
		this.output.newChapter(this.place.displayName());
		await this.playCurrentScene()
	}

	get layout(): GameScreenLayout {
		return {
			...super.layout,
			right: <PlaceSidebar context={this} ref={this.sidebarRef}/>
		}
	}

	canRest(): boolean {
		return this.place.canRest()
	}

	async onRestClick() {
		if (!this.canRest()) return;

		this.disableActions();
		this.say("You rest...");
		this.gc.recoverPlayer();
		this.endButton();
		await this.flush();
	}

	canManageInventory(): boolean {
		return this.place.canManageInventory()
	}

	async onInventoryClick() {
		if (!this.canManageInventory()) return;

		await this.gc.openTransferMenu(null);
	}

	async onCharacterClick() {
		let screen = new PlayerMenuScreen(this.player, this.place.canLevelUp())
		await screen.showModal()
		this.refCharacterPanel.current?.update()
		this.sidebarRef.current?.forceUpdate()
	}

	canExplore(): boolean {
		return this.player.isAlive && this.place.canExplore();
	}

	async onExploreClick() {
		this.disableActions();
		let encounter = this.place.pickEncounter();
		if (!encounter) {
			this.say("You find nothing");
			this.endButton();
			await this.flush();
			return;
		}
		await this.play(encounter.scene);
	}

	protected checkDeadEnd() {
		if (!this.canExplore() && !this.canRest()) {
			super.checkDeadEnd();
		}
	}

	private disableActions(andChoices: boolean = true) {
		this.sidebarRef.current?.disable();
		if (andChoices) this.output.flip();
	}

	protected async buttonClick(c: InternalChoiceData): Promise<void> {
		this.disableActions(false);
		await super.buttonClick(c);
	}

	onKeyboardEvent(event: KeyboardEvent) {
		if (this.sidebarRef.current?.handleKeyboardEvent(event)) return;
		super.onKeyboardEvent(event);
	}
}
