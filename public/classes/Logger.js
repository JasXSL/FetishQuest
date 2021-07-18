

export class Logger{

	constructor( name ){

		this.name = name;
		this.time = 0;
		this.reset();

	}

	log( operation ){

		console.log(this.name+" >> "+operation+" : "+(Date.now()-this.time));
		this.reset();
		return this;

	}

	reset(){

		this.time = Date.now();

	}

}

