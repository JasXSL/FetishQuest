// This is a helper script for all ASSET editors

export default{

	// Automatically binds all inputs, textareas, and selects with the class saveable and a name attribute indicating the field to to save
	// win is a windowmanager object
	// Autobind ADDS an event, so you can use el.eventType = fn before calling autobind if you want
	autoBind( win, asset ){

		const dom = win.dom,
			dev = window.mod
		;

		dom.querySelectorAll(".saveable[name]").forEach(el => el.addEventListener('change', event => {

			const targ = event.currentTarget,
				name = targ.name
			;

			let val = targ.value.trim();
			
			if( targ.tagName === 'INPUT' ){

				const type = targ.type;
				if( type === 'range' || type === 'number' )
					val = +val;
				
				if( type === 'checkbox' )
					val = Boolean(targ.checked);

			}
			/*
			else if( targ.tagName === 'TEXTAREA' ){

			}
			else if( targ.tagName === 'SELECT' ){
				
			}
			*/

			// Soft = here because type isn't important
			if( val != asset[name] ){

				asset[name] = val;
				dev.setDirty(true);

			}

		}));


	}


};

