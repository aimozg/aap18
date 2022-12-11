import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {Fragment, h, VNode} from "preact";
import {AttrMetadata} from "../../../../game/data/stats";
import {Button} from "../../components/Button";
import {signValue} from "../../../utils/math";
import {Parse} from "../../../text/ParseTag";
import {numberOfThings} from "../../../text/utils";

export class PlayerAttributesTab extends AbstractPlayerScreenTab {
	get label() {
		if (this.canLevelUp && this.player.attrPoints > 0) return <div class="d-ib text-nowrap">
			Attributes<span class="d-ib text-hl text-xs"
			                style="transform: translate(0, -33%)">(+{this.player.attrPoints})</span>
		</div>
		return "Attributes"
	}

	node(): VNode {
		// TODO merge with ChargenStepAttrs if possible
		// TODO instead of iterating over AttrMetadata, make a class "CreatureAttribute" that holds its id, name, descr, natural & total
		return <Fragment>
			<h3>Attributes</h3>
			<p>
				You have {numberOfThings(this.player.attrPoints,'attribute point','attribute points')}.
				You get +1 to attribute of your choice every 4 levels.
			</p>
			<div class="d-grid ai-start gap-2" style="grid-template-columns: repeat(5, max-content) 1fr">
				<div class="th">Attribute</div>
				<div class="th cols-2">Natural</div>
				<div class="th cols-2">Total</div>
				<div class="th">Description</div>

				{AttrMetadata.map(meta => <Fragment>
					<div class="text-hl">{meta.name}</div>
					<div class="attr-value">{this.player.naturalAttr(meta.id)}</div>
					{
						this.canLevelUp
							? <Button disabled={this.player.attrPoints <= 0} className="js-start"
							          onClick={() => this.screen.incAttr(meta.id)} label="+"/>
							: <div/>
					}
					<div
						class={"attr-value " + signValue(this.player.attr(meta.id) - this.player.naturalAttr(meta.id), 'text-negative', '', 'text-positive')}>{this.player.attr(meta.id)}</div>
					<div>{/*TODO getAttrValueName from ChargenStepAttr*/}</div>
					<div><Parse>{meta.description}</Parse><br/>{/*TODO explainStat from ChargenStepAttr*/}</div>
				</Fragment>)}

			</div>
		</Fragment>
	}
}
