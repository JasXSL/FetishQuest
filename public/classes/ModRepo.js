

export default class ModRepo{

	constructor(){



	}

	getDownloadUrl( user, token, modName ){

		return '/media/usrdata/'+String(user)+"/mods/"+encodeURIComponent(token)+"/"+encodeURIComponent(modName);

	}

	async downloadMod( token ){

		return mod.modRepo.modReq('Download', {token:token});

	}

	async search( text = "", startFrom = 0 ){

		return this.modReq("Search", {
			text : text,
			startFrom : startFrom
		});

	}

	// returns false or user data {id:(str)id, name:(str)name}
	async isLoggedIn(){
		
		if( !localStorage.jasx_session )
			return false;

		const att = await this.modReq('ValidateLoginToken', {token : localStorage.jasx_session});
		if( !att )
			this.logOut();

		return att;

	}

	async logIn( user, pass ){
		
		const req = await this.modReq('Login', {user:user, pass:pass});
		if( !req )
			return;

		localStorage.jasx_session = req.token;
		return true;

	}

	async logOut(){
		delete localStorage.jasx_session;
	}

	// {mods:mods}
	async listMyMods(){
		return this.modReq('ListMyMods');
	}

	async updateMod( token, file ){

		return this.modReq('UpdateMod', {token:token}, file);

	}

	async togglePublic( token, pub ){
		return this.modReq('ToggleModPublic', {
			token:token, 
			pub:pub
		});
	}

	async deleteMod( token ){
		return modReq("DeleteMod", {token:token});
	}

	// Sends a request to the server
	async modReq( task, data = {}, file = false ){

		// TOdo: error handler
		const formData = new FormData();
		formData.append('data', JSON.stringify(data));
		formData.append('token', localStorage.jasx_session);
		formData.append('task', task);
		if( file ){
			formData.append('file', file);
		}

		try{
			const req = await fetch('/mods', {
				method : 'POST',
				body : formData
			});

			// Got a zip file
			if( req.headers.get("Content-Type") === 'application/octet-stream' ){

				let filename = req.headers.get('content-disposition');
				filename = filename.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/)[1];

				const blob = await req.blob();
				const file = window.URL.createObjectURL(blob);
				
				const link = document.createElement('a');
				link.href = file;
				link.download = filename;
				link.click();
				setTimeout(() => window.URL.revokeObjectURL(file), 250);

				return true;
			}

			const out = await req.json();
			
			if( out.success )
				return out.data;
			
			console.log("out", out);
			if( out.data.error )
				console.error("Task error:", out.data.error);

		}catch(err){
			console.error("Online error:", err);
		}
		return false;

	}


};


