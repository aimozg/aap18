import {PlaceContext} from "../../place/PlaceContext";
import {Component, ComponentChild, h, RenderableProps} from "preact";
import {Button, execUIAction, UIAction} from "../components/Button";
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
		this.state = {disabled: false}
	}

	disable() {
		this.setState({disabled: true});
	}

	enable() {
		this.setState({disabled: false});
	}

	static HkRest = KeyCodes.KEYR;
	static HkInventory = KeyCodes.KEYI;
	static HkLevelUp = KeyCodes.KEYP;
	static HkExplore = KeyCodes.KEYE;

	private aRest: UIAction = {
		disabled: () => this.state.disabled || !this.props.context.canRest(),
		hotkey: PlaceSidebar.HkRest,
		callback: () => this.props.context.onRestClick()
	}

	private aInventory: UIAction = {
		disabled: () => this.state.disabled || !this.props.context.canManageInventory(),
		hotkey: PlaceSidebar.HkInventory,
		callback: () => this.props.context.onInventoryClick()
	}

	private aLevelup: UIAction = {
		disabled: () => this.state.disabled || !this.props.context.canLevelUp(),
		hotkey: PlaceSidebar.HkLevelUp,
		callback: () => this.props.context.onLevelUpClick()
	}

	private aExplore: UIAction = {
		disabled: () => this.state.disabled || !this.props.context.canExplore(),
		hotkey: PlaceSidebar.HkExplore,
		callback: () => this.props.context.onExploreClick()
	}

	private actions = [this.aRest, this.aInventory, this.aLevelup, this.aExplore];

	handleKeyboardEvent(e: KeyboardEvent): boolean {
		return execUIAction(e, this.actions);
	}

	render(props: RenderableProps<PlaceSidebarProps>, state: Readonly<PlaceSidebarState>): ComponentChild {
		let pc = this.props.context;
		return <div class="place-actions-panel">
			<div class="ma-2">
				<div class="place-name text-bold">{pc.place.displayName()}</div>
				<div className="place-description text-small">{pc.place.description()}</div>
			</div>
			<div class="place-actions d-flex flex-column ai-stretch gap-2 ma-2">
				<Button label="Rest"
				        className="-big"
				        action={this.aRest}/>
				<Button label="Inventory"
				        className="-big"
				        action={this.aInventory}/>
				<Button label="Level Up"
				        className="-big"
				        action={this.aLevelup}/>
				<Button label="Explore"
				        className="-big"
				        action={this.aExplore}/>
			</div>
		</div>;
	}

}