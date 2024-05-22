import Calculator from "../Calculator.js";
import { Wrapper } from "../EffectSys.js";
import GameEvent from "../GameEvent.js";
import Player from "../Player.js";

export default class DescBuffer{

	static LABEL_DAMAGE = 'D';
	static LABEL_HEAL = 'H';
	static LABEL_NO_STACK_MULTI = 'N';
	static LABEL_BLOCK = 'B';	// Block multiplier
	static LABEL_AROUSAL = 'A';	// Arousal multiplier

	rawText = '';
	buffer = [];

	// Only desc is required. However, the rest only work if you also supply a target and sender.
	// Ignore target if you want unmodified numbers
	compile( desc, sender, target, action, wrapper, effect ){

		// Rebuild buffer
		if( desc !== this.rawText ){

			this.rawText = desc;
			let buffer = desc.split(/(\$[^{\d]*(?:{[^}]*}|[\d]+)?)/g);
			this.buffer = buffer.map(el => {
				if( el.charAt(0) === '$' )
					return new BufferStruct(el.substring(1));
				return el;
			});

		}
		
		const senderIsPlayer = sender instanceof Player;
		const targetIsPlayer = target instanceof Player;
		const evt = new GameEvent({
			sender, target, action, wrapper, effect,
		});
		
		let output = [];
		for( let el of this.buffer ){

			let n = el;
			if( el instanceof BufferStruct ){
				
				let num = el.num;
				if( typeof num === "string" ){
					num = Calculator.run(num, evt);
				}

				if( senderIsPlayer ){

					if( el.damage )
						num = sender.calculateDamageAgainst(num, target, action, wrapper, effect);
					if( el.heal )
						num = sender.calculateHealingAgainst(num, target, action, wrapper, effect);
					if( el.block && targetIsPlayer )
						num = target.calculateBlockFrom(num);
					if( el.arousal && targetIsPlayer )
						num = target.calculateArousalFrom(num, sender);
					if( el.stackMulti && wrapper instanceof Wrapper )
						num *= wrapper.stacks;

					if( num%1 ){
						num = Math.trunc(num);
						num += "-" + (num+1);
					}
				}

				n = '|s|'+String(num)+'|/s|';

			}
			output.push(n);

		}
		// Stylize escapes
		return stylizeText(output.join(""));

	}

}

class BufferStruct{

	num = 0;
	heal = false;		// Add healing
	damage = false;		// Add damage
	stackMulti = true;
	block = false;
	arousal = false;

	constructor( str ){


		let data = str.split(/((?<!{.+)\d.*|{+.*)/); // Splits on number if it's not preceded by { or splits by {
		const tags = data[0];
		this.num = +data[1] || 0;
		if( data[1].charAt(0) === '{' )
			this.num = data[1].substring(1, data[1].length-1);

		this.heal = tags.includes(DescBuffer.LABEL_HEAL);
		this.damage = tags.includes(DescBuffer.LABEL_DAMAGE);
		this.block = tags.includes(DescBuffer.LABEL_BLOCK);
		this.arousal = tags.includes(DescBuffer.LABEL_AROUSAL);
		this.stackMulti = !tags.includes(DescBuffer.LABEL_NO_STACK_MULTI);
		
	}

}
