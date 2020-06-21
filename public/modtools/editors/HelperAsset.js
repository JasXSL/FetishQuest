// This is a helper script for all ASSET editors
import Window from '../WindowManager.js';

export default{

	// Automatically binds all inputs, textareas, and selects with the class saveable and a name attribute indicating the field to to save
	// win is a windowmanager object
	// Autobind ADDS an event, so you can use el.eventType = fn before calling autobind if you want
	// List is the name of the array in mod.<array> that the asset is stored in
	// Also binds JSON
	autoBind( win, asset, list ){

		const dom = win.dom,
			dev = window.mod
		;

		// Binds simple inputs
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

			// Soft = here because type isn't important
			if( val != asset[name] ){

				asset[name] = val;
				dev.setDirty(true);
				if( list )
					Window.rebuildWindowsByTypeAndId("Database", list);


			}

		}));

		this.bindJson( win, asset, list );


	},

	// Automatically binds JSON fields. Needs to be a textarea with class json and name being the field you want to put the data in
	bindJson( win, asset, list ){

		const dev = window.mod;		

		const updateData = textarea => {

			try{
				
				textarea.value = textarea.value.trim();
				
				if( !textarea.value )
					textarea.value = '{}';

				let data = JSON.parse(textarea.value);
				textarea.value = JSON.stringify(data, undefined, 2);	// Auto format

				// Check if it has changed
				if( JSON.stringify(data) !== JSON.stringify(asset.data) ){
					
					asset[textarea.name] = data;
					dev.setDirty(true);
					Window.rebuildWindowsByTypeAndId("Database", list);

				}

			}catch(err){
				alert("JSON Syntax error: "+(err.message || err));
				let e = String(err).split(' ');
				let pos = parseInt(e.pop());
				textarea.focus();
				textarea.setSelectionRange(pos, pos);

			}

		};

		win.dom.querySelectorAll('textarea.json[name]').forEach(el => {

			updateData(el);
			el.addEventListener('change', () => updateData(el) );

		});

	},

};

