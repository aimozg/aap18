import {PlaceContext} from "../../place/PlaceContext";
import {Component, ComponentChild, h, RenderableProps} from "preact";
import {Button} from "../components/Button";
import {KeyCodes} from "../KeyCodes";

export interface PlaceSidebarProps {
    context: PlaceContext
}

export interface PlaceSidebarState {
    disabled: boolean
}

export class PlaceSidebar extends Component<PlaceSidebarProps, PlaceSidebarState> {

    constructor(props: PlaceSidebarProps, context?: any) {
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
    static HkExplore = KeyCodes.KEYE;

    handleKeyboardEvent(e:KeyboardEvent):boolean {
        switch (KeyCodes.eventToHkString(e)) {
            case PlaceSidebar.HkRest:
                this.props.context.onRestClick();
                return true;
            case PlaceSidebar.HkInventory:
                this.props.context.onInventoryClick();
                return true;
            case PlaceSidebar.HkLevelUp:
                this.props.context.onLevelUpClick();
                return true;
            case PlaceSidebar.HkExplore:
                this.props.context.onExploreClick();
                return true;
        }
        return false;
    }

    render(props: RenderableProps<PlaceSidebarProps>, state:Readonly<PlaceSidebarState>): ComponentChild {
        let pc = this.props.context;
        return <div class="place-actions-panel">
            <div class="ma-2">
                <div class="place-name text-bold">{pc.place.displayName()}</div>
                <div className="place-description text-small">{pc.place.description()}</div>
            </div>
            <div class="place-actions d-flex flex-column ai-stretch gap-2 ma-2">
                <Button label="Rest"
                        className="-big"
                        disabled={state.disabled || !pc.canRest()}
                        hotkey={PlaceSidebar.HkRest}
                        onClick={()=>pc.onRestClick()}/>
                <Button label="Inventory"
                        className="-big"
                        disabled={state.disabled || !pc.canManageInventory()}
                        hotkey={PlaceSidebar.HkInventory}
                        onClick={()=>pc.onInventoryClick()}/>
                <Button label="Level Up"
                        className="-big"
                        disabled={state.disabled || !pc.canLevelUp()}
                        hotkey={PlaceSidebar.HkLevelUp}
                        onClick={()=>pc.onLevelUpClick()}/>
                <Button label="Explore"
                        className="-big"
                        disabled={state.disabled || !pc.canExplore()}
                        hotkey={PlaceSidebar.HkExplore}
                        onClick={()=>pc.onExploreClick()}/>
            </div>
        </div>;
    }

}