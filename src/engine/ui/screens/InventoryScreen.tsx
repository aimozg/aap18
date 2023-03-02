import {Fragment, h, VNode} from "preact";
import {Creature} from "../../objects/Creature";
import {Button, execUIAction, UIAction} from "../components/Button";
import {KeyCodes} from "../KeyCodes";
import {CommonText} from "../../text/CommonText";
import {Item} from "../../objects/Item";
import {Inventory} from "../../objects/Inventory";
import {TextOutput} from "../../text/output/TextOutput";
import {AbstractModalScreen} from "../AbstractModalScreen";
import {Game} from "../../Game";
import {damageSpan} from "../../text/utils";

type ItemAction = UIAction & { longLabel: string, position: number }

interface ItemMenu {
	item: Item | null;
	slotName?: string;
	natural?: boolean;
	equipped?: boolean;
	aSelect?: UIAction;
	actions: ItemAction[];
}

/** Allowed actions */
export interface InventoryScreenOptions {
	/** (If transfer menu) Player is allowed to take items from the other inventory */
	take: boolean;
	/** (If transfer menu) Player is allowed to store items to the other inventory */
	put: boolean;
	/** Player is allowed to use and consume items */
	use: boolean;
	/** Player is allowed to equip items */
	equip: boolean;
	/** Player is allowed to unequip items */
	unequip: boolean;
	/** Player is allowed to discard items */
	discard: boolean;
}
// TODO log actions

function unhotkey(a: UIAction): UIAction {
	return Object.assign({}, a, {hotkey: undefined})
}

export class InventoryScreen extends AbstractModalScreen<void> {

	/**
	 * If `other` is null, manage `creature`'s equipment.
	 * Otherwise, transfer items between `creature.inventory` and `other`
	 */
	constructor(
		public readonly creature: Creature,
		public readonly other: Inventory | null = null,
		options: Partial<InventoryScreenOptions> = {}
	) {
		super();
		this.options = Object.assign({
			take: true,
			put: true,
			use: true,
			equip: true,
			unequip: true,
			discard: true,
		}, options);
	}

	readonly options: InventoryScreenOptions;
	private isEquipmentScreen = !this.other;
	readonly main = this.creature.inventory;

	onActivate() {
		super.onActivate();
		this.update();
	}

// TODO store category & position instead
	selectedItem: Item | null = null;
	private textOutput: TextOutput = new TextOutput(Game.instance.screenManager.sharedTextPanel)
	private mainInvMenus: ItemMenu[] = [];
	private otherInvMenus: ItemMenu[] = [];

	private equipmentMenus(): ItemMenu[] {
		let c = this.creature;
		let equipmentInfos: {
			slot: string,
			item: Item | null,
			natural?: Item,
			hotkey?: string
		}[] = [{
			slot: "Main weapon",
			item: c.mainHandItem,
			natural: c.fists,
			// hotkey: KeyCodes.KEYW
		}, {
			slot: "Body armor",
			item: c.bodyArmor,
			// hotkey: KeyCodes.KEYA
		}];
		return equipmentInfos.map(ei => ({
			item: ei.item ?? ei.natural ?? null,
			slotName: ei.slot,
			natural: ei.natural && !ei.item,
			aSelect: this.selectItemAction(ei.item ?? ei.natural, ei.hotkey),
			actions: ei.item ? this.itemActions(ei.item) : []
		}));
	}

	// TODO consider moving it outside
	private itemActions(item: Item): ItemAction[] {
		let inMain = this.main.includes(item);
		let equipped = !inMain && this.isEquipmentScreen;
		let result: ItemAction[] = [];
		if (this.isEquipmentScreen) {
			if (inMain) {
				if (this.options.equip && this.isEquipable(item)) {
					result.push({
						position: 1,
						label: "E",
						longLabel: "Equip",
						hotkey: KeyCodes.KEYE,
						// TODO disabled if fails canEquip
						callback: () => this.equip(item)
					})
				}
			} else if (this.options.unequip) {
				result.push({
					position: 1,
					label: "U",
					longLabel: "Unequip",
					hotkey: KeyCodes.KEYU,
					// TODO disabled if fails canUnequip
					callback: () => this.unequip(item)
				})
			}
		}
		if (this.options.use && item.isConsumable) {
			result.push({
				position: 1,
				label: "U",
				longLabel: "Use",
				hotkey: KeyCodes.KEYU,
				// TODO disabled if fails canUse
				callback: () => this.consume(item)
			});
		}
		if (!this.isEquipmentScreen) {
			if (inMain && this.options.put) {
				result.push({
					position: 2,
					label: "<",
					longLabel: "Store",
					hotkey: KeyCodes.ENTER,
					// TODO disabled if item not transferable
					callback: () => this.transferItem(item)
				})
			} else if (!inMain && this.options.take) {
				result.push({
					position: 2,
					label: ">",
					longLabel: "Take",
					hotkey: KeyCodes.ENTER,
					// TODO disabled if item not transferable
					callback: () => this.transferItem(item)
				})
			}
		}
		if (!equipped && this.options.discard) {
			result.push({
				position: 2,
				label: "D",
				longLabel: "Discard",
				hotkey: KeyCodes.DELETE,
				// TODO disabled if item cannot be discarded
				callback: () => this.discard(item)
			})
		}
		return result;
	}

	private inventoryMenus(inventory: Inventory): ItemMenu[] {
		return inventory.map((item, i) => {
			if (!item) {
				return {
					item: null,
					actions: []
				}
			}
			return {
				item: item,
				aSelect: this.selectItemAction(item, KeyCodes.DefaultHotkeys[i]),
				equipped: false,
				actions: this.itemActions(item)
			}
		});
	}

	private selectItemAction(
		item: Item | null | undefined,
		hotkey: string | undefined,
		disabled?: boolean
	): UIAction | undefined {
		return {
			hotkey: hotkey,
			disabled: disabled || !item,
			callback: () => item && this.selectItem(item)
		}
	}

	update() {
		// TODO equip/unequip/drop hotkeys
		this.mainInvMenus = this.inventoryMenus(this.main);
		this.otherInvMenus = !!this.other
			? this.inventoryMenus(this.other)
			: this.equipmentMenus();
		this.updateActions();
		this.render();
	}

	private updateActions() {
		if (!this.main.includes(this.selectedItem) && !(this.otherInvMenus.find(im=>im.item===this.selectedItem))) {
			this.selectedItem = null;
		}
		this.actions = [...this.basicActions];
		if (this.other) this.actions.push(this.aTakeAll);
		for (let im of [...this.mainInvMenus, ...this.otherInvMenus]) {
			if (im.aSelect) this.actions.push(im.aSelect);
			if (im.item === this.selectedItem) {
				this.actions.push(...im.actions);
			} else {
				this.actions.push(...im.actions.map(a => unhotkey(a)))
			}
		}
	}

	private isEquipable(item: Item): boolean {
		// TODO check if has Equipable aspect and can be equipped
		return item.isArmor || item.isWeapon;
	}

	selectItem(item: Item | null) {
		this.selectedItem = item;
		this.updateActions();
		this.render();
	}

	async unequip(item: Item) {
		await this.game.gameController.unequipToInventory(this.creature, item);
		this.update();
	}

	async equip(item: Item) {
		await this.game.gameController.equipFromInventory(this.creature, item);
		this.update();
	}

	async transferItem(item: Item) {
		if (!this.other) throw new Error(`No storage to transfer item to/from`)
		if (this.main.includes(item)) {
			this.main.transferTo(item, this.other);
		} else if (this.other.includes(item)) {
			this.other.transferTo(item, this.main);
		}
		this.update();
	}

	async transferAll(fromMain:boolean, andClose:boolean=true) {
		if (!this.other) throw new Error(`No storage to transfer item to/from`)
		for (let item of (fromMain ? this.main : this.other)) {
			if (item) await this.transferItem(item);
		}
		if (andClose && (fromMain ? this.main : this.other).isEmpty) {
			await this.close();
		}
	}

	async consume(item: Item) {
		// TODO inventory log bug this.textOutput.clear();
		if (this.creature.inventory.includes(item)) {
			await this.game.gameController.consumeFromInventory(this.creature, item, this.textOutput)
		} else if (this.other && this.other?.includes(item)) {
			await this.game.gameController.consumeItem(this.creature, item, this.textOutput)
			this.other.removeItem(item)
		}
		this.textOutput.flush();
		this.selectedItem = null;
		this.update()
	}

	async discard(item: Item) {
		if (this.main.includes(item)) {
			this.main.removeItem(item)
		} else {
			this.other?.removeItem(item)
		}
		this.selectedItem = null;
		this.update();
	}

	private selCat(): number {
		if (!this.selectedItem) return -1;
		if (this.mainInvMenus.some(im => im.item === this.selectedItem)) return 1;
		return 0;
	}

	private selIdx(): number {
		if (!this.selectedItem) return -1;
		let i = this.mainInvMenus.findIndex(im => im.item === this.selectedItem);
		if (i >= 0) return i;
		return this.otherInvMenus.findIndex(im => im.item === this.selectedItem)
	}

	moveSelection(d: number) {
		let categories = [this.otherInvMenus, this.mainInvMenus];

		let catNo = this.selCat();
		let idx = this.selIdx();
		if (catNo === -1 || idx === -1) {
			// nothing selected, select first item or equipment
			for (let cat of categories) {
				if (this.selectFirstInCategory(cat)) return;
			}
		} else {
			// goto next/prev non-empty slot
			idx += d;
			let cat = categories[catNo];
			while (idx >= 0 && idx < cat.length) {
				let im = cat[idx];
				if (im.aSelect) {
					im.aSelect.callback();
					return;
				}
				idx += d;
			}
		}
	}

	selectFirstInCategory(cat: ItemMenu[]): boolean {
		for (let im of cat) {
			if (im.aSelect) {
				im.aSelect.callback();
				return true;
			}
		}
		return false;
	}

	selectCategory(n: number) {
		this.selectFirstInCategory(n === 1 ? this.mainInvMenus : this.otherInvMenus);
	}

	private aClose: UIAction = {
		label: "Close",
		hotkey: KeyCodes.ESCAPE,
		callback: () => this.close()
	}
	private aTakeAll: UIAction = {
		label: "Take All",
		hotkey: KeyCodes.KEYA,
		disabled: () => !this.options.take || this.main.isFull,
		callback: () => this.transferAll(false)
	}
	private basicActions: UIAction[] = [
		this.aClose,
		{
			hotkey: KeyCodes.ARROWUP,
			callback: () => this.moveSelection(-1)
		}, {
			hotkey: KeyCodes.ARROWDOWN,
			callback: () => this.moveSelection(+1)
		}, {
			hotkey: KeyCodes.ARROWLEFT,
			callback: () => this.selectCategory(0)
		}, {
			hotkey: KeyCodes.ARROWRIGHT,
			callback: () => this.selectCategory(1)
		}
	];
	private actions: UIAction[] = [];

	private renderItemMenu(im: ItemMenu): VNode {
		let item = im.item;
		let action1 = im.actions.find(a => a.position === 1);
		let action2 = im.actions.find(a => a.position === 2);
		return <div class={"inventory-row" + (item && item === this.selectedItem ? " -active" : "")}>

			{im.aSelect
				? <Button action={im.aSelect} className="-flat -icon"/>
				: <div/>}

			<div class={!im.item || im.natural ? "text-shadowed" : ""}>{item?.name ?? "-"}</div>

			<div class={!im.item || im.natural ? "text-shadowed" : ""}>{item && CommonText.itemInfo(item)}</div>

			{action1
				? <Button action={action1 && unhotkey(action1)} className="-flat -icon"/>
				: <div/>}

			{action2
				? <Button action={action2 && unhotkey(action2)} className="-flat -icon"/>
				: <div/>}

		</div>
	}

	node(): VNode {
		let selitem = this.selectedItem;
		return <div class="ui-box screen-inventory">
			<div class="grid-2 gap-4 screen-inventory-main">
				<div class="grid-v2">
					<div>
						<h3>{this.isEquipmentScreen ? "Equipment" : this.other!.name}</h3>
						<div class={this.isEquipmentScreen ? "inventory-equipment" : "inventory-items"}>
							{this.otherInvMenus.map(im => <Fragment>
								<div>{im.slotName}</div>
								{this.renderItemMenu(im)}
							</Fragment>)}
						</div>
					</div>
					<div class="inventory-iteminfo">
						{selitem && <Fragment>
                            <h3>{selitem.name}</h3>
							{selitem.asArmor && <div>
                                <span className="text-hl">[Armor]</span><br/>
                                Defense: {selitem.asArmor.defenseBonus} <br/>
                                DR: {selitem.asArmor.drBonus}
                            </div>}
							{selitem.asWeapon && <div>
                                <span className="text-hl">[Weapon]</span><br/>
								{selitem.asWeapon.attackModes.map(mode=><div>
									{mode.name}: {damageSpan(mode.damage,mode.damageType)}
								</div>)}
                            </div>}
							{/* TODO rich IP descriptions, hidden IPs, IP hints */}
							{selitem.properties.map(ip=>
								<div>{ip.name}</div>
							)}
                            <div class="d-flex gap-4 my-4">
								{this.itemActions(selitem).map(action =>
									<Button label={action.longLabel}
									        action={action}
									        className="-big"/>
								)}
                            </div>
                        </Fragment>}
						<div class="my-4">
							{/*TODO bring it back this.textOutput.panel.astsx*/}
						</div>
					</div>
				</div>
				<div class="d-flex flex-column oy-hidden">
					<h3>{this.main.name}</h3>
					<div class="inventory-items oy-auto">
						{this.mainInvMenus.map(im => this.renderItemMenu(im))}
					</div>
				</div>
			</div>
			<div class="d-flex gap-4 my-4 screen-inventory-footer">
				{<div>
					Gold: <span class="text-money">{this.creature.money.format(",d")}</span>
				</div>}
				<div class="flex-grow-1">&nbsp;</div>
				<Button action={this.aTakeAll} className="-big"/>
				<Button action={this.aClose} className="-big"/>
			</div>
		</div>
	}

	onKeyboardEvent(event: KeyboardEvent) {
		execUIAction(event, this.actions);
	}
}
