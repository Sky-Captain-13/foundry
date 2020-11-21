const Toggler = (() => {
  // VERSION INFORMATION
  const Toggler_Author = "Sky#9453";
  const Toggler_Version = "0.0.1";
  const Toggler_LastUpdated = 1605926745;

	function toggleDarkvision(app, html, data) {
		let items = data.actor.items;
		let goggles = items.find(i => i.name.toLowerCase() === "goggles of night");
		if (goggles) {
			let actor = game.actors.get(data.actor._id);
			let tokens = actor.getActiveTokens();
			for (let token of tokens) {
				if (!token.data.flags?.toggler?.init) {
					token.update({
						"flags.toggler.init": true,
						"flags.toggler.orig_dimSight": token.data.dimSight
					});
				}
				let orig_dimSight = token.data.flags?.toggler?.orig_dimSight;
				if (goggles.data.equipped) {
					token.update({ dimSight: orig_dimSight + 60 });
				} else {
					token.update({ dimSight: orig_dimSight });
				}
			}
		}
	}
	
	Hooks.on("ready", function() {
		Hooks.on("renderActorSheet5eCharacter", (app, html, data) => {
			toggleDarkvision(app, html, data);
		});
		console.log("-=> Toggler v" + Toggler_Version + " <=- [" + (new Date(Toggler_LastUpdated * 1000)) + "]");
	});
})();