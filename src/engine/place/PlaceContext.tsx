import {Place} from "./Place";
import {InternalChoiceData, SceneContext} from "../scene/SceneContext";
import {TextOutput} from "../text/output/TextOutput";
import {ScenePanel} from "../ui/panels/ScenePanel";
import {GameScreenLayout} from "../ui/screens/GameScreen";
import {PlaceSidebar} from "../ui/panels/PlaceSidebar";
import {createRef, h} from "preact";

export class PlaceContext extends SceneContext {
    readonly sidebarRef = createRef<PlaceSidebar>();

    constructor(public place: Place) {
        super(place.sceneId, new TextOutput(new ScenePanel()));
    }

    async display():Promise<void> {
        this.sidebarRef.current?.enable();
        this.sidebarRef.current?.forceUpdate();
        await this.playCurrentScene()
    }

    get layout(): GameScreenLayout {
        return Object.assign(super.layout, {
            right: <PlaceSidebar context={this} ref={this.sidebarRef}/>
        })
    }

    canRest():boolean {
        return this.place.canRest()
    }

    onRestClick() {
        if (!this.place.canRest()) return;

        this.disableActions();
        this.say("You rest...");
        this.gc.recoverPlayer();
        this.endButton();
        this.flush().then();
    }
    canManageInventory():boolean {
        return this.place.canManageInventory()
    }
    onInventoryClick() {
        this.say("This feature is not implemented yet...");
        // TODO implement inventory menu
    }

    canLevelUp():boolean {
        return this.place.canLevelUp() && this.player.canLevelUp();
    }

    onLevelUpClick() {
        this.say("This feature is not implemented yet...");
        // TODO implement levelup menu
    }

    canExplore():boolean {
        return this.player.isAlive && this.place.canExplore();
    }

    onExploreClick() {
        this.disableActions();
        let encounter = this.place.pickEncounter();
        if (!encounter) {
            this.say("You find nothing");
            this.endButton();
            this.flush().then()
            return;
        }
        this.play(encounter.scene).then();
    }

    protected checkDeadEnd() {
        if (!this.canExplore() && !this.canRest()) {
            super.checkDeadEnd();
        }
    }

    private disableActions(andChoices:boolean=true) {
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