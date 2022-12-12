import {PlaceContext} from "../../place/PlaceContext";
import {Component, ComponentChild, Fragment, h, RenderableProps} from "preact";
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
	static HkCharacter = KeyCodes.KEYP;
	static HkExplore = KeyCodes.KEYE;

	private aRest: UIAction = {
		label: "Rest",
		disabled: () => this.state.disabled || !this.props.context.canRest(),
		hotkey: PlaceSidebar.HkRest,
		callback: () => this.props.context.onRestClick()
	}

	private aInventory: UIAction = {
		label: "Inventory",
		disabled: () => this.state.disabled || !this.props.context.canManageInventory(),
		hotkey: PlaceSidebar.HkInventory,
		callback: () => this.props.context.onInventoryClick()
	}

	private aCharacterMenu: UIAction = {
		disabled: () => this.state.disabled,
		hotkey: PlaceSidebar.HkCharacter,
		callback: () => this.props.context.onCharacterClick()
	}

	private aExplore: UIAction = {
		disabled: () => this.state.disabled || !this.props.context.canExplore(),
		hotkey: PlaceSidebar.HkExplore,
		callback: () => this.props.context.onExploreClick()
	}

	private actions = [this.aRest, this.aInventory, this.aCharacterMenu, this.aExplore];

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
				<Button label="Explore"
				        className="-big"
				        action={this.aExplore}/>
				<Button label="Rest"
				        className="-big"
				        action={this.aRest}/>
				<Button label={
					<Fragment>Character{pc.place.canLevelUp()
						&& (pc.player.canLevelUpNow() || pc.player.skillPoints > 0 || pc.player.attrPoints > 0 || pc.player.perkPoints > 0)
						&& <span class="text-elevated text-hl">+</span>}</Fragment>
				}
				        className="-big"
				        action={this.aCharacterMenu}/>
				<Button label="Inventory"
				        className="-big"
				        action={this.aInventory}/>
			</div>
		</div>;
	}

}
