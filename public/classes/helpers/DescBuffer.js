import { Wrapper } from "../EffectSys.js";
import Player from "../Player.js";

export default class DescBuffer{

	static LABEL_DAMAGE = 'D';
	static LABEL_HEAL = 'H';
	static LBAEL_NO_STACK_MULTI = 'N';

	rawText = '';
	buffer = [];

	// Only desc is required. However, the rest only work if you also supply a target and sender.
	// Ignore target if you want unmodified numbers
	compile( desc, sender, target, action, wrapper, effect ){

		// Rebuild buffer
		if( desc !== this.rawText ){

			this.rawText = desc;
			let buffer = desc.split(/(\$.*?\d+)/g);
			this.buffer = buffer.map(el => {
				if( el.charAt(0) === '$' )
					return new BufferStruct(el.substring(1));
				return el;
			});

		}
		const senderIsPlayer = sender instanceof Player;
		const targetIsPlayer = target instanceof Player;
		
		let output = [];
		for( let el of this.buffer ){

			let n = el;
			if( el instanceof BufferStruct ){
				
				let num = el.num;
				if( senderIsPlayer ){

					if( el.damage )
						num = sender.calculateDamageAgainst(num, target, action, wrapper, effect);
					if( el.heal )
						num = sender.calculateHealingAgainst(num, target, action, wrapper, effect);

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

	constructor( data ){

		data = data.split(/(\d+)/);
		const tags = data[0];
		this.num = +data[1] || 0;
		this.heal = tags.includes(DescBuffer.LABEL_HEAL);
		this.damage = tags.includes(DescBuffer.LABEL_DAMAGE);
		this.stackMulti = !tags.includes(DescBuffer.LBAEL_NO_STACK_MULTI);
		
	}

}

