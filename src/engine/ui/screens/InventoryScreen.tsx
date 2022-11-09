import {AbstractScreen} from "../AbstractScreen";
import {Fragment, h, VNode} from "preact";
import {Creature} from "../../objects/Creature";
import {Button, execUIAction, UIAction} from "../components/Button";
import {Game} from "../../Game";
import {KeyCodes} from "../KeyCodes";
import {CommonText} from "../../text/CommonText";
import {Item} from "../../objects/Item";
import {Deferred} from "../../utils/Deferred";

interface ItemMenu {
	item: Item | null;
	slotName?: string;
	natural?: boolean;
	equipped?: boolean;
	aSelect?: UIAction;
	action1?: UIAction;
	action2?: UIAction;
}

export class InventoryScreen extends AbstractScreen {

	constructor(public creature: Creature) {
		super();
	}

	promise = new Deferred<void>();

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
	private inventoryMenus: ItemMenu[] = [];
	private equipmentMenus: ItemMenu[] = [];

	update() {
		let c = this.creature;
		let equipmentInfos: {
			slot: string,
			item: Item | null,
			natural?: Item,
			hotkey: string
		}[] = [{
			slot: "Main weapon",
			item: c.mainHandItem,
			natural: c.fists,
			hotkey: KeyCodes.KEYW
		}, {
			slot: "Body armor",
			item: c.bodyArmor,
			hotkey: KeyCodes.KEYA
		}];
		// TODO equip/unequip/drop hotkeys

		const selectItemAction: (
			item: Item | null | undefined,
			hotkey: string | undefined,
			disabled?: boolean
		) => UIAction | undefined = (item, hotkey, disabled = false) => {
			return {
				hotkey: hotkey,
				disabled: disabled || !item,
				callback: () => item && this.selectItem(item)
			}
		}
		this.inventoryMenus = c.inventory.map((item, i) => {
			let action1: UIAction | undefined, action2;
			if (this.isEquipable(item)) {
				action1 = {
					label: "E",
					// TODO disabled if of equipable class but fails canEquip
					callback: () => this.equip(item)
				}
			}
			// TODO action2 is drop/transfer
			return {
				item: item,
				aSelect: selectItemAction(item, KeyCodes.DefaultHotkeys[i]),
				equipped: false,
				action1,
				action2
			}
		});
		this.equipmentMenus = equipmentInfos.map(ei => ({
			item: ei.item ?? ei.natural ?? null,
			slotName: ei.slot,
			natural: ei.natural && !ei.item,
			aSelect: selectItemAction(ei.item ?? ei.natural, ei.hotkey),
			action1: !!ei.item ? {
				label: "U",
				callback: () => this.unequip(ei.item!)
			} : undefined
		}));
		this.actions = [...this.basicActions];
		for (let im of [...this.inventoryMenus, ...this.equipmentMenus]) {
			if (im.aSelect) this.actions.push(im.aSelect);
			if (im.action1) this.actions.push(im.action1);
			if (im.action2) this.actions.push(im.action2);
		}
		this.render();
	}

	private isEquipable(item: Item): boolean {
		// TODO check if has Equipable aspect and can be equipped
		return item.isArmor || item.isWeapon;
	}

	selectItem(item: Item | null) {
		this.selectedItem = item;
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

	private selCat(): number {
		if (!this.selectedItem) return -1;
		if (this.creature.inventory.includes(this.selectedItem)) return 0;
		return 1;
	}

	private selIdx(): number {
		if (!this.selectedItem) return -1;
		let i = this.creature.inventory.indexOf(this.selectedItem);
		if (i >= 0) return i;
		return this.equipmentMenus.findIndex(im => im.item === this.selectedItem)
	}

	moveSelection(d: number) {
		let categories = [this.inventoryMenus, this.equipmentMenus];

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
		this.selectFirstInCategory(n === 0 ? this.inventoryMenus : this.equipmentMenus);
	}

	private hasWeapon(): boolean { return !!this.creature.mainHandItem }

	private hasArmor(): boolean { return !!this.creature.bodyArmor }

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
	private actions: UIAction[] = [...this.basicActions];

	private renderItemMenu(im: ItemMenu): VNode {
		let item = im.item;
		return <div class={"inventory-row" + (item && item === this.selectedItem ? " -active" : "")}>

			{im.aSelect
				? <Button action={im.aSelect} className="-flat -icon"/>
				: <div/>}

			<div class={!im.item || im.natural ? "text-shadowed" : ""}>{item?.name ?? "-"}</div>

			<div class={!im.item || im.natural ? "text-shadowed" : ""}>{item && CommonText.itemInfo(item)}</div>

			{im.action1
				? <Button action={im.action1} className="-flat -icon"/>
				: <div/>}

			{im.action2
				? <Button action={im.action2} className="-flat -icon"/>
				: <div/>}

		</div>
	}

	node(): VNode {
		let c = this.creature;

		let selitem = this.selectedItem;
		return <div class="ui-box screen-inventory d-flex flex-column">
			<div class="grid-2 gap-4 flex-grow-1">
				<div>
					<h3>Inventory</h3>
					<div class="inventory-items">
						{this.inventoryMenus.map(im => this.renderItemMenu(im))}
					</div>
				</div>
				<div class="grid-v2">
					<div>
						<h3>Equipment</h3>
						<div class="inventory-equipment">
							{this.equipmentMenus.map(im => <Fragment>
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
                        </Fragment>}
					</div>
				</div>
			</div>
			<div class="d-flex">
				<div>
					Gold: <span class="text-money">{c.money.format(",d")}</span>
				</div>
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