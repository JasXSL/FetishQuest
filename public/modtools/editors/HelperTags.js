import Tags from '../../libraries/stdTag.js';

// Creates a tag editor. Put this inside a div with a name of the asset property you want to assign the tags to
export default {
	
	build : function( tags ){
		tags = toArray(tags);

		// Build datalist if not already built
		let datalist = document.getElementById("datalist_tags");
		if( !datalist ){
			datalist = document.createElement("datalist");
			datalist.id = 'datalist_tags';
			document.getElementById("datalists").appendChild(datalist);

			for( let tag of Object.values(Tags) ){
				
				const node = document.createElement("option");
				node.value = tag;
				datalist.appendChild(node);

			}

		}

		let out = '<div class="tagEditor">';
		for( let tag of tags )
			out += this.buildInput(tag);
		out += '</div>';
		out += '<input type="button" value="Add" />';

		return out;

	},

	buildInput : function( value, string = true ){
		
		const out = document.createElement('input');
		out.setAttribute('type', 'text');
		out.classList.add('tag');
		out.setAttribute('list', 'datalist_tags');
		if( value )
			out.setAttribute('value', value);

		if( !string )
			return out;

		console.log("returning", out);
		return out.outerHTML;

	},


	// Binds the add new button, ctrl click and change. Calls onChange when a change is detected.
	// Element should be the wrapping element defined in the parent code. The parent of div.tagEditor created in the default function above
	bind : function( element, onChange ){

		const compile = () => {

			const out = [];
			element.querySelectorAll("div.tagEditor input.tag").forEach(el => {
				
				let val = el.value.trim();
				if( val )
					out.push(val);

			});

			onChange(out);

		};

		element.querySelectorAll("div.tagEditor input.tag").forEach(el => el.onchange = compile);
		element.querySelectorAll("div.tagEditor input.tag").forEach(el => el.onclick = evt => {
			
			const el = evt.currentTarget;
			if( evt.ctrlKey ){
				el.remove();
				compile();
			}

		});
		element.querySelector("input[value=Add]").onclick = evt => {
			evt.currentTarget.parentNode.querySelector("div.tagEditor").appendChild(this.buildInput(undefined, false));
			this.bind( element, onChange );
		};

	},

	// Automatically compares and updates an asset. Useful in onChange for asset editors.
	/*
		field = field of the asset to edit
		tags = tags from bind onChange event
		asset = asset to modify
	*/
	autoHandleAsset( field, tags, asset ){

		const pre = JSON.stringify(asset[field]),
			post = JSON.stringify(tags)
		;
		if( pre === post )
			return;
		window.mod.setDirty(true);
		asset[field] = tags;

	}

}

