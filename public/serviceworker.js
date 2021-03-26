if( self.location.hostname.split('.')[0].toLowerCase() === 'fetishquest' ){

	const CACHE_NAME = 'fq_cache';
	const urlsToCache = [
		'/media/ui/logo_64.png',
		'/media/ui/logo_128.png',
		'/media/ui/logo_256.png',
		'/media/ui/logo_512.png',
		'/media/ui/marble.jpg',
	];

	self.addEventListener('install', function(event) {
		console.log("ITWERKS!!");

		// Perform install steps
		event.waitUntil(
			caches.open(CACHE_NAME)
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
		event.respondWith(
			caches.match(event.request)
				.then(function(response) {
					// Cache hit - return response
					if (response) {
						return response;
					}
					return fetch(event.request);
				}
			)
		);
	});

}