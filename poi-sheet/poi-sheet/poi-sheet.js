const POISheet_Author = "Sky";
const POISheet_Version = "0.1.3";
const POISheet_LastUpdated = 1652226769; //Date.now().toString().substr(0, 10);

Hooks.on("ready", function() {
  console.log("-=> Point of Interest Sheet v" + POISheet_Version + " <=- [" + (new Date(POISheet_LastUpdated * 1000)) + "]");
});

class PoISheet extends ActorSheet {
	get template() {
		return "modules/poi-sheet/poi-sheet.html";
	}
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('dnd5e poi-sheet sheet actor character');
		mergeObject(options, {width: 672, height: 736});
		return options;
	}
}

Actors.registerSheet("dnd5e", PoISheet, {
	types: ["character"],
	makeDefault: false
});