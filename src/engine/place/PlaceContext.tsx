import {Place} from "./Place";
import {InternalChoiceData, SceneContext} from "../scene/SceneContext";
import {TextOutput} from "../text/output/TextOutput";
import {ScenePanel} from "../ui/panels/ScenePanel";
import {GameScreenLayout} from "../ui/screens/GameScreen";
import {PlaceActionsPanel} from "../ui/panels/PlaceActionsPanel";
import {createRef, h} from "preact";

export class PlaceContext extends SceneContext {
    readonly actionsPanelRef = createRef<PlaceActionsPanel>();

    constructor(public place: Place) {
        super(place.sceneId, new TextOutput(new ScenePanel()));
    }

    async display():Promise<void> {
        this.actionsPanelRef.current?.enable();
        this.actionsPanelRef.current?.forceUpdate();
        await this.playCurrentScene()
    }

    get layout(): GameScreenLayout {
        return Object.assign(super.layout, {
            right: <PlaceActionsPanel context={this} ref={this.actionsPanelRef}/>
        })
    }

    onRestClick() {
        if (!this.place.canRest()) return;

        this.disableActions();
        this.output.flip();
        this.say("You rest...");
        this.gc.recoverPlayer();
        this.endButton();
        this.flush().then();
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

    private disableActions() {
        this.actionsPanelRef.current?.disable();
    }

    protected async buttonClick(c: InternalChoiceData): Promise<void> {
        this.disableActions();
        await super.buttonClick(c);
    }

    onKeyboardEvent(event: KeyboardEvent) {
        if (this.actionsPanelRef.current?.handleKeyboardEvent(event)) return;
        super.onKeyboardEvent(event);
    }
}