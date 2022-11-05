import {PlaceContext} from "../../place/PlaceContext";
import {Component, ComponentChild, h, RenderableProps} from "preact";
import {Button} from "../components/Button";
import {KeyCodes} from "../KeyCodes";

export interface PlaceActionsPanelProps {
    context: PlaceContext
}

export interface PlaceActionsPanelState {
    disabled: boolean
}

export class PlaceActionsPanel extends Component<PlaceActionsPanelProps, PlaceActionsPanelState> {

    constructor(props: PlaceActionsPanelProps, context?: any) {
        super(props, context);
        this.state = {disabled:false}
    }

    disable() {
        this.setState({disabled:true});
    }
    enable() {
        this.setState({disabled:false});
    }
    static HkRest = KeyCodes.KEYR;
    static HkInventory = KeyCodes.KEYI;
    static HkLevelUp = KeyCodes.KEYP;

    handleKeyboardEvent(e:KeyboardEvent):boolean {
        switch (KeyCodes.eventToHkString(e)) {
            case PlaceActionsPanel.HkRest:
                this.props.context.onRestClick();
                return true;
            case PlaceActionsPanel.HkInventory:
                this.props.context.onInventoryClick();
                return true;
            case PlaceActionsPanel.HkLevelUp:
                this.props.context.onLevelUpClick();
                return true;
        }
        return false;
    }

    render(props: RenderableProps<PlaceActionsPanelProps>, state:Readonly<PlaceActionsPanelState>): ComponentChild {
        let pc = this.props.context;
        return <div class="place-actions-panel">
            <div class="place-name ma-2 text-bold">{pc.place.displayName()}</div>
            <div class="place-actions d-flex flex-column ai-stretch gap-2 ma-2">
                <Button label="Rest"
                        className="-big"
                        disabled={state.disabled || !pc.place.canRest()}
                        hotkey={PlaceActionsPanel.HkRest}
                        onClick={()=>pc.onRestClick()}/>
                <Button label="Inventory"
                        className="-big"
                        disabled={state.disabled || !pc.place.canManageInventory()}
                        hotkey={PlaceActionsPanel.HkInventory}
                        onClick={()=>pc.onInventoryClick()}/>
                <Button label="Level Up"
                        className="-big"
                        disabled={state.disabled || !pc.canLevelUp()}
                        hotkey={PlaceActionsPanel.HkLevelUp}
                        onClick={()=>pc.onLevelUpClick()}/>
            </div>
        </div>;
    }

}