import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {h, VNode} from "preact";

export class PlayerItemsTab extends AbstractPlayerScreenTab {
	label = "Items"

	node(): VNode {
		return <div>
			<h3>Items</h3>
			<div className="help-block">TODO This tab is not implemented yet. {/*Inject existing inventory/equipment screen?*/}</div>
			</div>
	}
}
