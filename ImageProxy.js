const ALLOWED_DOMAINS = [
	'imgur\.com$',
	'e621\.net$'
];


const https = require('https'), URL = require('url');

function fetch(url, depth = 0){


	if( depth > 3 ){
		return 429;
	}

	const parse = URL.parse(url);

	if( !parse.hostname || !parse.path )
		return 400;
	


	const urlAllowed = () => {
		for( let domain of ALLOWED_DOMAINS ){

			const exp = new RegExp(domain);
			if( parse.hostname.match( exp ) )
				return true;
				
		}
	};

	if( !urlAllowed() ){
		return 400;
	}

	return new Promise((res, rej) => {

		https.request( 
			url, 
			response => {
	
				if( response.statusCode === 200 ){
					res(response);
				}
				else if( response.headers.location ){
	
					res(fetch(response.headers.location, depth+1));
	
				}
				else{
					res(response.statusCode);
				}
	
			}
		).end();

	});
	

};


module.exports = async (req, res, next) => {

	const url = req.query.image;
	if( url ){

		try{

			const parse = URL.parse(url);
			const myHost = req.get('host');
			if( parse.host === myHost || !parse.host ){
				res.redirect('https://'+myHost+'/'+parse.path);	// This is our host, redirect to that instead
				return;
			}
			
			const data = await fetch(url);
			if( typeof data === "number" ){
				res.sendStatus(data);
			}else{
				const allowed = [
					'image/jpeg',
					'image/png',
					'image/jpg',
				];
				const ctype = data.headers['content-type'];
				if( !allowed.includes(ctype.toLowerCase()) ){
					res.sendStatus(400);
					return;
				}
				res.writeHead(200, {
					'Content-Type': ctype,
					'Cache-Control': 'public, max-age=31557600',
				});
				data.pipe(res);
			}

		}catch(err){
			console.error(err);
			res.sendStatus(500);
		}
		return;

	}
	

	res.sendStatus(400);

};

