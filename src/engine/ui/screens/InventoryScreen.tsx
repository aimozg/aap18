import {AbstractScreen} from "../AbstractScreen";
import {Fragment, h, VNode} from "preact";
import {Creature} from "../../objects/Creature";
import {Button, execUIAction, UIAction} from "../components/Button";
import {Game} from "../../Game";
import {KeyCodes} from "../KeyCodes";
import {CommonText} from "../../text/CommonText";
import {Item} from "../../objects/Item";
import {Deferred} from "../../utils/Deferred";
import {Inventory} from "../../objects/Inventory";
import {TextOutput} from "../../text/output/TextOutput";
import {ScenePanel} from "../panels/ScenePanel";

type ItemAction = UIAction & {longLabel:string, position:number}

interface ItemMenu {
	item: Item | null;
	slotName?: string;
	natural?: boolean;
	equipped?: boolean;
	aSelect?: UIAction;
	actions: ItemAction[];
}
export interface InventoryScreenOptions {
	take: boolean;
	put: boolean;
	use: boolean;
	discard: boolean;
}

function unhotkey(a:UIAction):UIAction {
	return Object.assign({}, a, {hotkey:undefined})
}

export class InventoryScreen extends AbstractScreen {

	/**
	 * If `right` is null, manage `creature`'s equipment.
	 * Otherwise, transfer items between `creature.inventory` and `right`
	 */
	constructor(
		public readonly creature: Creature,
		public readonly right: Inventory|null=null,
		options: Partial<InventoryScreenOptions> = {}
	) {
		super();
		this.options = Object.assign({
			take: true,
			put: true,
			use: true,
			discard: true,
		}, options);
	}
	readonly options: InventoryScreenOptions;
	private isEquipmentScreen = !this.right;
	readonly left = this.creature.inventory;
	readonly promise = new Deferred<void>();

	async showModal() {
		await this.game.screenManager.addOnTop(this, 'fade-fast');
		await this.promise;
	}

	async close() {
		await Game.instance.screenManager.closeTop("fade-fast");
		this.promise.resolve();
	}

	onActivate() {
		if (this.promise.completed) throw new Error("Cannot re-add InventoryScreen");
		super.onActivate();
		this.update();
	}

	selectedItem: Item | null = null;
	private textOutput: TextOutput = new TextOutput(new ScenePanel())
	private leftMenus: ItemMenu[] = [];
	private rightMenus: ItemMenu[] = [];

	private equipmentMenus():ItemMenu[] {
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
	private itemActions(item:Item):ItemAction[] {
		let left = this.left.includes(item);
		let equipped = !left && this.isEquipmentScreen;
		let result:ItemAction[] = [];
		if (this.isEquipmentScreen) {
			if (left) {
				if (this.isEquipable(item)) {
					result.push({
						position: 1,
						label: "E",
						longLabel: "Equip",
						hotkey: KeyCodes.KEYE,
						// TODO disabled if fails canEquip
						callback: () => this.equip(item)
					})
				}
			} else {
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
				callback: ()=>this.consume(item)
			});
		}
		if (!this.isEquipmentScreen) {
			if (left && this.options.put) {
				result.push({
					position: 2,
					label: ">",
					longLabel: "Store",
					hotkey: KeyCodes.ENTER,
					// TODO disabled if item not transferable
					callback: () => this.transferItem(item)
				})
			} else if (!left && this.options.take) {
				result.push({
					position: 2,
					label: "<",
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
	private inventoryMenus(inventory:Inventory, left:boolean):ItemMenu[] {
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
		this.leftMenus = this.inventoryMenus(this.left, true);
		this.rightMenus = !!this.right
			? this.inventoryMenus(this.right, false)
			: this.equipmentMenus();
		this.updateActions();
		this.render();
	}

	private updateActions() {
		this.actions = [...this.basicActions];
		for (let im of [...this.leftMenus, ...this.rightMenus]) {
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

	async transferItem(item:Item) {
		let right = this.right;
		if (!right) throw new Error(`No storage to transfer item to/from`)
		if (this.left.includes(item)) {
			this.left.transferTo(item, right);
		} else if (right.includes(item)) {
			right.transferTo(item, this.left);
		}
		this.update();
	}

	async consume(item: Item) {
		this.textOutput.clear();
		if (this.creature.inventory.includes(item)) {
			await this.game.gameController.consumeFromInventory(this.creature, item, this.textOutput)
		} else if (this.right && this.right?.includes(item)) {
			await this.game.gameController.consumeItem(this.creature, item, this.textOutput)
			this.right.removeItem(item)
		}
		this.textOutput.flush();
		this.update()
	}

	async discard(item: Item) {
		if (this.left.includes(item)) {
			this.left.removeItem(item)
		} else {
			this.right?.removeItem(item)
		}
	}

	private selCat(): number {
		if (!this.selectedItem) return -1;
		if (this.leftMenus.some(im=>im.item===this.selectedItem)) return 0;
		return 1;
	}

	private selIdx(): number {
		if (!this.selectedItem) return -1;
		let i = this.leftMenus.findIndex(im => im.item === this.selectedItem);
		if (i >= 0) return i;
		return this.rightMenus.findIndex(im => im.item === this.selectedItem)
	}

	moveSelection(d: number) {
		let categories = [this.leftMenus, this.rightMenus];

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
		this.selectFirstInCategory(n === 0 ? this.leftMenus : this.rightMenus);
	}

	private aClose: UIAction = {
		hotkey: KeyCodes.ESCAPE,
		callback: () => this.close()
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
		let action1 = im.actions.find(a=>a.position===1);
		let action2 = im.actions.find(a=>a.position===2);
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
		return <div class="ui-box screen-inventory d-flex flex-column">
			<div class="grid-2 gap-4 flex-grow-1">
				<div>
					<h3>{this.left.name}</h3>
					<div class="inventory-items">
						{this.leftMenus.map(im => this.renderItemMenu(im))}
					</div>
				</div>
				<div class="grid-v2">
					<div>
						<h3>{this.isEquipmentScreen ? "Equipment" : this.right!.name}</h3>
						<div class={this.isEquipmentScreen ? "inventory-equipment" : "inventory-items"}>
							{this.rightMenus.map(im => <Fragment>
								<div>{im.slotName}</div>
								{this.renderItemMenu(im)}
							</Fragment>)}
						</div>
					</div>
					<div class="inventory-iteminfo">
						{selitem && <Fragment>
                            <h3>{selitem.name}</h3>
							{selitem.asArmor && <div>
                                Defense: {selitem.asArmor.defenseBonus} <br/>
                                DR: {selitem.asArmor.drBonus}
                            </div>}
							{selitem.asWeapon && <div>
                                Damage: {selitem.asWeapon.damage.toString()} <br/>
                                Damage type: <span
                                class={'text-damage-' + selitem.asWeapon.damageType.cssSuffix}>{selitem.asWeapon.damageType.name}</span>
                            </div>}
							<div class="d-flex gap-4">
								{this.itemActions(selitem).map(action=>
									<Button label={action.longLabel}
									        action={action}
									        className="-big"/>
								)}
							</div>
                        </Fragment>}
					</div>
				</div>
			</div>
			<div>
				{this.textOutput.panel.astsx}
			</div>
			<div class="d-flex">
				{<div>
					Gold: <span class="text-money">{this.creature.money.format(",d")}</span>
				</div>}
				<div class="flex-grow-1">&nbsp;</div>
				<Button label="Close"
				        action={this.aClose}
				        default={true}/>
			</div>
		</div>
	}

	onKeyboardEvent(event: KeyboardEvent) {
		execUIAction(event, this.actions);
	}
}