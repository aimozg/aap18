import {AbstractScreen} from "../AbstractScreen";
import {Fragment, h, VNode} from "preact";
import {Creature} from "../../objects/Creature";
import {Button} from "../components/Button";
import {Game} from "../../Game";
import {KeyCodes} from "../KeyCodes";
import {CommonText} from "../../text/CommonText";
import {Item} from "../../objects/Item";

export class InventoryScreen extends AbstractScreen {

	constructor(public creature: Creature) {
		super();
	}

	async onCloseClick() {
		await Game.instance.screenManager.closeTop("fade-fast");
	}

	selectedItem: Item | null = null;

	selectItem(item: Item | null) {
		this.selectedItem = item;
		this.render();
	}

	async unequip(item: Item) {
		await this.game.gameController.unequipToInventory(this.creature, item);
		this.render();
	}

	async equip(item: Item) {
		await this.game.gameController.equipFromInventory(this.creature, item);
		this.render();
	}

	node(): VNode {
		let c = this.creature;
		let equipmentData: ({
			item: Item | null;
			natural?: boolean;
			hotkey: string;
		})[] = [{
			hotkey: KeyCodes.KEYW,
			item: c.currentWeapon,
			natural: c.currentWeapon === c.fists
		}, {
			hotkey: KeyCodes.KEYA,
			item: c.bodyArmor
		}];
		let selitem = this.selectedItem;
		return <div class="ui-box screen-inventory d-flex flex-column">
			<div class="grid-2 gap-4 flex-grow-1">
				<div>
					<h3>Inventory</h3>
					<div class="inventory-items">
						{c.inventory.map((item, i) =>
							<Fragment>
								{(i in KeyCodes.DefaultHotkeys)
									? <Button hotkey={KeyCodes.DefaultHotkeys[i]}
									          onClick={() => this.selectItem(item)}/>
									: <div></div>}
								<div>{item.name}</div>
								<div>{CommonText.itemInfo(item)}</div>
								{(item.isWeapon || item.isArmor)
									? <Button label="Equip"
									          onClick={() => this.equip(item)}/>
									: <div></div>}
							</Fragment>
						)}
					</div>
				</div>
				<div class="grid-v2">
					<div>
						<h3>Equipment</h3>
						<div class="inventory-equipment">
							{equipmentData.map(ed =>
								<Fragment>
									<Button hotkey={ed.hotkey}
									        disabled={ed.natural || !ed.item}
									        onClick={() => this.selectItem(ed.item!)}
									/>
									<div>{ed.item?.name}</div>
									<div>{ed.item && CommonText.itemInfo(ed.item)}</div>
									<Button label="Unequip"
									        disabled={ed.natural || !ed.item}
									        onClick={() => this.unequip(ed.item!)}/>
								</Fragment>
							)}
						</div>
					</div>
					{selitem
						? <div>
							<h3>{selitem.name}</h3>
							{selitem.asArmor && <div>
								Defense: {selitem.asArmor.defenseBonus} <br/>
								DR: {selitem.asArmor.drBonus}
							</div>}
							{selitem.asWeapon && <div>
								Damage: {selitem.asWeapon.damage.toString()}{' '}
								<span class={'text-damage-'+selitem.asWeapon.damageType.cssSuffix}>{selitem.asWeapon.damageType.name}</span>
							</div>}
						</div>
						: <div></div>}
				</div>
			</div>
			<div class="d-flex">
				<div>
					Gold: <span class="text-money">{c.money.format(",d")}</span>
				</div>
				<div class="flex-grow-1">&nbsp;</div>
				<Button label="Close"
				        hotkey="ESC"
				        default={true}
				        onClick={() => this.onCloseClick()}/>
			</div>
		</div>
	}

	onKeyboardEvent(event: KeyboardEvent) {

	}
}