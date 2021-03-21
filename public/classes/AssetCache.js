// Generic cache class for textures/geometry etc. Anything in a 3d cell that can be cached
class Cache{
	constructor(){
		this.cache = [];			// Holds CacheAsset objects
		this.max_assets = 100;		// hold a max of 100 assets in cache
		Cache.caches.push(this);
	}

	prune(){
		if( this.cache.length < this.max_assets )
			return;
		// Remove the last used items
		this.cache.sort((a,b) => {
			if( a.used === b.used )
				return 0;
			return a.used > b.used ? -1 : 1;
		});
		this.cache = this.cache.slice(0, this.max_assets);
	}

	// Fetches the CacheAsset asset from cache
	fetch( path ){

		for( let c of this.cache ){

			if( c.path === path ){

				c.use();
				c.asset.__cached = true;
				return c.asset;

			}

		}
		let ca = new CacheAsset(path, this.fetchMissingAsset(path));
		this.cache.push(ca);
		return ca.asset;
		
	}

	// Needs to be overwritten in the implementation
	// Can be async
	fetchMissingAsset( path ){ console.error("No fetch handler for ", path, " you need to overwrite the fetchMissingAsset method"); }

}

class CacheAsset{
	constructor( path, asset ){
		this.path = path;
		this.asset = asset;			// For meshes this is a promise. For textures this is a textureloader instance
		this.used = Date.now();
	}

	use(){
		this.used = Date.now();
	}
}


Cache.caches = [];
// Generally run this after loading a dungeon cell
Cache.pruneAll = function(){
	for( let cache of this.caches )
		cache.prune();
}

export default Cache;