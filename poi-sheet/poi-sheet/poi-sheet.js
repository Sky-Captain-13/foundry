class PoISheet extends ActorSheet {
	get template() {
		if ( !game.user.isGM && this.actor.limited ) return "modules/poi-sheet/poi-sheet.html";
		return "modules/poi-sheet/poi-sheet.html";
	}
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('dnd5e sheet actor character');
		mergeObject(options, {width: 672, height: 736});
		return options;
	}
}

Actors.registerSheet("dnd5e", PoISheet, {
	types: ["character"],
	makeDefault: false
});