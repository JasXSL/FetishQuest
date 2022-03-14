if( self.location.hostname.split('.')[0].toLowerCase() === 'fetishquest' ){

	const CACHE_VERSION = 'v4';
	const urlsToCache = [
		'/media/ui/logo_64.png',
		'/media/ui/logo_128.png',
		'/media/ui/logo_256.png',
		'/media/ui/logo_512.png',
		'/media/ui/marble.jpg',
		'/index.html',
		'/style.css',
		'/globalFunctions.js',

	];
	const alwaysCache = [
		'jpg', 'jpeg', 'png', 'jd', 'js', 'css', 'html', 'ogg', 'glb'
	];
	
	self.addEventListener('activate', (event) => {
		var cacheKeeplist = [CACHE_VERSION];
	  
		event.waitUntil(
			caches.keys().then((keyList) => {
				return Promise.all(keyList.map((key) => {
					if(cacheKeeplist.indexOf(key) === -1) {
						return caches.delete(key);
					}
				}));
			})
		);
	});

	self.addEventListener('install', function(event) {
		console.log("ITWERKS!!");

		// Perform install steps
		event.waitUntil(
			caches.open(CACHE_VERSION)
			.then(cache => {
				console.log('Opened cache');
				return cache.addAll(urlsToCache);
			}).then(() => {
				console.log("Caches installed");
			}).catch(err => {
				console.error("Unable to add cache", err);
			})
		);
		
	});

	self.addEventListener('fetch', function(event) {

		const url = new URL(event.request.url);
		let fileType = url.pathname.split('.').pop().toLowerCase();
		
		event.respondWith(
			caches.match(event.request)
				.then(function(response) {

					// Cache hit - return response
					return response || fetch(event.request).then(response => {
						return caches.open(CACHE_VERSION).then(cache => {

							if( 
								(
									alwaysCache.includes(fileType) ||
									(fileType === 'js' && url.pathname.startsWith('/ext/') )	// This isn't used as long as js is in the main
								) && 
								url.origin === 'https://fetishquest.com' // Only cache our own files
							){
								console.log("Putting ", event.request.url, "into cache");
								cache.put(event.request, response.clone());
							}
							return response;

						});
					});
				}
			)
		);
	});

}