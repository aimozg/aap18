import {BaseItem} from "../BaseItem";
import {ItemEffect} from "../ItemEffect";
import {Creature} from "../Creature";
import {TextOutput} from "../../text/output/TextOutput";
import {Game} from "../../Game";

export class BaseConsumable extends BaseItem {

    constructor(resId: string,
                name: string,
                public effects: ItemEffect[]) {
        super(resId, name);
    }

    async consume(creature:Creature, output:TextOutput) {
        for (let effect of this.effects) {
            await effect.apply(Game.instance.gameController, creature, output)
        }
    }
}