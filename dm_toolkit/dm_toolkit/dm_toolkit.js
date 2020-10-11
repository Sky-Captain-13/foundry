const DMToolKit = (() => {
	// VERSION INFORMATION
	const DMToolkit_Author = "Sky";
	const DMToolkit_Version = "1.0.2";
	const DMToolkit_LastUpdated = 0;
	
	// CONFIGURATION
	const announceTokenHPChange = true; // Change to module settings configuration
	const setDefaultImage = true;
	
	// FUNCTIONS
	// Adjust Token HP and Send Results to Chat
	const adjustTokenHP = function(changeType, amount, announce) {
		// Loop through selected tokens and add or subtract hpChange from the HP Bar.
		let count = 0;
		const promises = [];
			for ( let token of canvas.tokens.controlled ) {
				let message = "";
				let actor = token.actor;
				let hp = actor.data.data.attributes.hp;
				let roll = new Roll(amount).roll();
				let hpChange = roll.total;
				let tooltip = amount + " (" + roll._result + ")";
				count += 1;
				if (changeType === "Healing" || changeType === "Potion") {
					// Heal
					promises.push(token.actor.update({
						"data.attributes.hp.value": Math.min(hp.value + hpChange, hp.max)
					}));
					let healType = (changeType === "Healing") ? "is healed for" : "drinks a potion and is healed for";
					let plural = (hpChange != 1) ? "s" : "";
					message = `
					<div class="dnd5e chat-card item-card">
						<header class="card-header flexrow">
							<img src="${actor.data.token.img}" width="36" height="36" style="border: none; margin: auto 5px;"/>
							<h3 style="line-height: unset; margin: auto 0px;">${actor.data.name} ${healType} <span title="${tooltip}">${hpChange}</span> hit point${plural}.</h3>
						</header>
					</div>`;
				} else {
					// Damage
					let temphp = parseInt(hp.temp) || 0;
					let damage = Math.max(hpChange - temphp, 0);
					temphp = (temphp === 0) ? "" : Math.max(temphp - hpChange, 0);
					promises.push(token.actor.update({
						"data.attributes.hp.temp": temphp,
						"data.attributes.hp.value": Math.max(hp.value - damage, 0)
					}));
					message = `
					<div class="dnd5e chat-card item-card">
						<header class="card-header flexrow">
							<img src="${actor.data.token.img}" width="36" height="36" style="border: none; margin: auto 5px;"/>
							<h3 style="line-height: unset; margin: auto 0px;">${actor.data.name} takes <span title="${tooltip}">${hpChange}</span> damage.</h3>
						</header>
					</div>`;
				}
				if (announce) {
					ChatMessage.create({
						user: game.user._id,
						speaker: { alias: "DM Toolkit" },
						content: message,
						type: CONST.CHAT_MESSAGE_TYPES.OTHER,
						sound: (count <= 1) ? CONFIG.sounds.dice : ""
					});
				}
			}
		return Promise.all(promises);
	}
	
	// Handles API commands entered via chat/macros.
	const handleInput = function(message, chatData) {
		//console.log(message);
		if ( chatData.charAt(0) === "!") {
			let command = chatData.split(" ")[0].trim();
			let args = chatData.replace(command, "").trim();
			
			// !fow moves the Fog of War tiles to the front or back
			if (command === "!fow" && game.user.isGM) {
				let scene = canvas.scene;
				let fowRgx = new RegExp("fow.png");
				let tileUpdates = duplicate(scene.data.tiles).map(t => {
					if ( fowRgx.test(t.img) ) t.z = (args.toLowerCase() === "hide") ? -9999 : 1000;
					return t;
				});
				scene.update({tiles: tileUpdates});
			}
			
			// !heal|damage applies damage or healing to the selected tokens
			if (command === "!heal" || command === "!damage" || command === "!dmg") {
				let changeType = (command === "!heal") ? "Healing" : "Damage";
				if (args !== "") {
					adjustTokenHP(changeType, args, announceTokenHPChange);
				} else {
					setTimeout(function() {
						let applyChange = false;
						new Dialog({
							title: `Apply ${changeType}`,
							content: `
								<div style='height: 25px; line-height: 25px; font-size: 20px; margin-bottom: 10px; text-align: center;'>
									Amount of ${changeType}: <input id='dmtk_alterhp' name='hpChange' type='text' style='width: 150px; height: 30px;' value='0' onfocus='this.select()'>
								</div>`,
							buttons: {
								yes: {
									icon: "<i class='fas fa-check'></i>",
									label: `Apply ${changeType}`,
									callback: () => applyChange = true
								},
								no: {
									icon: "<i class='fas fa-times'></i>",
									label: `Cancel ${changeType}`
								},
							},
							default: "yes",
							close: html => {
								if (applyChange) adjustTokenHP(changeType, html.find('[name="hpChange"]')[0].value, announceTokenHPChange);
							}
						}).render(true);
						setTimeout(function() { document.getElementById("dmtk_alterhp").focus(); }, 100);
					}, 100);
				}
			}
			
			// Generate Points of Interest for Hexcrawl Maps
			if (command === "!hexgen") {
				const direction = [
					"in the same hex",
					"one hex northeast",
					"one hex northeast and one hex east",
					"one hex northeast and two hexes east",
					"two hexes northeast",
					"two hexes northeast and one hex east",
					"three hexes northeast",
					"one hex east",
					"two hexes east",
					"three hexes east",
					"one hex east and one hex southeast",
					"one hex east and two hexes southeast",
					"two hexes east and one hex southeast",
					"one hex southeast",
					"two hexes southeast",
					"three hexes southeast",
					"one hex southeast and one hex southwest",
					"one hex southeast and two hexes southwest",
					"two hexes southeast and one hex southwest",
					"one hex southwest",
					"two hexes southwest",
					"three hexes southwest",
					"one hex southwest and one hex west",
					"one hex southwest and two hexes west",
					"two hexes southwest and one hex west",
					"one hex west",
					"two hexes west",
					"three hexes west",
					"one hex west and one hex northwest",
					"one hex west and two hexes northwest",
					"two hexes west and one hex northwest",
					"one hex northwest",
					"two hexes northwest",
					"three hexes northwest",
					"one hex northwest and one hex northeast",
					"one hex northwest and two hexes northeast",
					"two hexes northwest and one hex northeast"
				];
				let count = new Roll("2d4").roll().total;
				let features = 0;
				let message = "";
				
				for (i = 0; i <= count; i++) {
					let distance = new Roll("1d4-1").roll().total;
					let hexes = (distance == 1) ? "hex" : "hexes";
					let directionCheck = new Roll("1d37-1").roll().total;
					let checkRoll = new Roll("1d20").roll().total;
					let featureRoll = new Roll("1d20").roll().total;
					let majorFeature = "";
					let checkText = "";
					let featureText = "";
					
					if (checkRoll >= 12) {
						// DISCOVERED A FEATURE
						if (checkRoll == 20) majorFeature = " (Major)";
						features++;
						if (featureRoll <= 3) {
							// RUINS
							checkText = `[${features}] You have discovered ruins ${direction[directionCheck]}.`;
						} else if (featureRoll >= 4 && featureRoll <= 6) {
							// CAVES
							checkText = `[${features}] You have found a cave ${direction[directionCheck]}.`;
						} else if (featureRoll >= 7 && featureRoll <= 9) {
							// NATURAL FEATURE
							checkText = `[${features}] You have come across an interesting natural feature ${direction[directionCheck]}.`;
						} else if (featureRoll >= 10 && featureRoll <= 11) {
							// LAIR
							checkText = `[${features}] You have found the lair of a dangerous foe ${direction[directionCheck]}.`;
						} else if (featureRoll >= 12 && featureRoll <= 14) {
							// CAMPSITE
							checkText = `[${features}] You spot a campsite ${direction[directionCheck]}.`;
						} else if (featureRoll >= 15 && featureRoll <= 16) {
							// SETTLEMENT
							checkText = `[${features}] You come across the signs of a nearby settlement ${direction[directionCheck]}.`;
						} else if (featureRoll >= 17 && featureRoll <= 19) {
							// UNUSUAL TERRAIN
							checkText = `[${features}] You stumble upon a pocket of land that is wildly different from the surrounding area, has abundant forage, or of an unusual type ${direction[directionCheck]}.`;
						} else {
							// MAGICAL FEATURE
							checkText = `[${features}] You come upon a magical feature ${direction[directionCheck]}.`;
						}
						message += checkText + `${majorFeature}` + "<br>";
					}
				}
				// CREATE CHAT MESSAGE AND SEND TO CHAT
				if (features == 0) message = "You have not found anything interesting.";
				let msgToChat = `
					<div class="dnd5e chat-card item-card">
						<header class="card-header flexrow">
							<img src="modules/dm_toolkit/Dungeon.png" width="36" height="36" style="border: none; margin: auto 5px;"/>
							<h3 style="line-height: unset; margin: auto 0px;">Hexgen</h3>
						</header>
						<div style="font-size: 14px;">
							${message}
						</div>
					</div>`;
				
				ChatMessage.create({
					user: game.user._id,
					speaker: { alias: "DM Toolkit" },
					whisper: ChatMessage.getWhisperIDs("GM"),
					content: msgToChat,
					type: CONST.CHAT_MESSAGE_TYPES.OTHER,
					sound: ""
				});
			}
			
			// Use a Potion of Healing
			if (command === "!potion") {
				let amount = "2d4+2";
				setTimeout(function() {
					let applyChange = false;
					new Dialog({
						title: `Drink a Potion`,
						content: `
							<div class="form-group">
								<label></label>
									<select id="dmtk_potions" name="potionRoll" style="margin-bottom: 5px; width: 100%;">
										<option value="2d4+2">Potion of Healing (2d4+2)</option>
										<option value="4d4+4">Potion of Greater Healing (4d4+4)</option>
										<option value="8d4+8">Potion of Superior Healing (8d4+8)</option>
										<option value="10d4+20">Potion of Supreme Healing (10d4+20)</option>
									</select>
							</div>`,
						buttons: {
							yes: {
								icon: "<i class='fas fa-check'></i>",
								label: `Drink`,
								callback: () => applyChange = true
							},
							no: {
								icon: "<i class='fas fa-times'></i>",
								label: `Put Away`
							},
						},
						default: "yes",
						close: html => {
							if (applyChange) adjustTokenHP("Potion", amount = html.find('[name="potionRoll"]')[0].value, announceTokenHPChange);
						}
					}).render(true);
					setTimeout(function() { document.getElementById("dmtk_potions").focus(); }, 100);
				}, 100);
			}
			
			// Set status icon on target
			if (command === "!icon") {
				for ( let target of game.user.targets ) {
					target.toggleEffect("../../icons/svg/acid.svg");
				}
			}
			
			// Turn order toolkit
			if (command === "!tot") {
				setTimeout(function() {
					let applyChange = false;
					new Dialog({
						title: `DM Toolkit`,
						content: `
							<div class="form-group">
								<label></label>
									<select id="dmtk_options" name="toolkitOptions" style="margin-bottom: 5px; width: 100%;">
										<option value="roll">Roll Initiative</option>
										<option value="sort">Sort Initiative</option>
										<option value="clear">Clear Initiative</option>
									</select>
							</div>`,
						buttons: {
							yes: {
								icon: "<i class='fas fa-check'></i>",
								label: `Accept`,
								callback: () => applyChange = true
							},
							no: {
								icon: "<i class='fas fa-times'></i>",
								label: `Cancel`
							},
						},
						default: "yes",
						close: html => {
							if (applyChange) selected = html.find('[name="toolkitOptions"]')[0].value;
							setTimeout(function() { document.getElementById("chat-message").focus(); }, 100);
						}
					}).render(true);
					setTimeout(function() { document.getElementById("dmtk_options").focus(); }, 100);
				}, 100);
			}
			
			// Resets a token to max hp, removes temp hp, and remove any status icons.
			if (command === "!reset") {
				adjustTokenHP("Healing", "9999", false);
			}
			
		// Don't send !commands to chat.
		return false;
		}
	};
	
	// Returns the scene that the user is viewing.
	const getSceneByUser = function(user) {
		return game.scenes.get(user.data.scene);
	};
	
	/* -- CURRENTLY BROKEN --
	// Sets prototype token defaults when actor is created.
	const setTokenDefaults = function(actors, actor) {
		let setDefaultImage = true;
		let tokenNameDisplay = (actor.type === "npc") ? CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER : CONST.TOKEN_DISPLAY_MODES.ALWAYS;
		let tokenVision = (actor.type === "npc") ? false : true;
		let tokenLink = (actor.type === "npc") ? false : true;
		if (setDefaultImage) actor.img = (actor.type === "npc") ? `assets/tokens/bestiary/${actor.name}.png` : "assets/badges/profession%20badges/Profession%20-%20Adventurer.png";
		
		// Loop through items and fix proficiency and finesse ability
		let actorItems = actor.items || {};
		for (let a = 0; a < actorItems.length; a++) {
			if (actorItems[a].type == "weapon") {
				if (actorItems[a].data.properties.fin) {
					if (actor.data.abilities.str.value > actor.data.abilities.dex.value) actorItems[a].data.ability = "str";
					else actorItems[a].data.ability = "dex";
				}
				actorItems[a].data.equipped = true;
				actorItems[a].data.proficient = true;
			}
		}
		
		// Merge data with the actor
		mergeObject(actor, {
			"token.name" : actor.name,
			"token.displayName" : tokenNameDisplay,
			"token.disposition" : CONST.TOKEN_DISPOSITIONS.NEUTRAL,
			"token.displayBars" : CONST.TOKEN_DISPLAY_MODES.ALWAYS,
			"token.bar1" : {"attribute" : "attributes.hp"},
			"token.bar2" : {"attribute" : ""},
			"token.img" : actor.img,
			"token.lockRotation" : true,
			"token.vision": tokenVision,
			"token.actorLink" : tokenLink,
			"actor.items": actorItems
		});
	};
	*/
	
	// Enables actor drag and drop to macrobar
	const actorDrop = async (bar, data, slot) => {
		if (data.type !== 'Actor') return;
		
		const actor = game.actors.get(data.id);
		if (!actor) return;
		
		const command = `if (game.actors.get('${data.id}')) game.actors.get('${data.id}').sheet.render(true);`;
		let macro = game.macros.entities.find(macro => macro.name === actor.name && macro.command === command);
		
		if (!macro) {
			macro = await Macro.create({
				name: actor.name,
				type: 'script',
				img: actor.data.img,
				command: command
			}, {
				renderSheet: false
			});
		}
		
		game.user.assignHotbarMacro(macro, slot);
		return false;
	};
	
	// HOOKS
	Hooks.on("ready", function() {
		Hooks.on("chatMessage", handleInput);
		Hooks.on("hotbarDrop", actorDrop);
		//Hooks.on("preCreateActor", setTokenDefaults);
		console.log("-=> DMToolkit v" + DMToolkit_Version + " <=- [" + (new Date(DMToolkit_LastUpdated * 1000)) + "]");
		//console.log(Date.now().toString().substr(0, 10)
	});
	
	//Hooks.on("init", () => PIXI.MIPMAP_MODES.POW2 = PIXI.MIPMAP_MODES.ON);
})();

/*
// Run API/Macro commands as GM
// https://github.com/kakaroto/fvtt-module-furnace/blob/master/Macros/Macros.js
const Toolkit = (() => {
  const handleInput = function(message, chatData) {
    if ( chatData.charAt(0) === "!") {
      game.socket.emit("module.toolkit", chatData);
      return false;
    }
  };
	
	const processCommand = function(chatData) {
		console.log(chatData);
		console.log(game.user);
	};
  
  // HOOKS
  Hooks.on("ready", function() {
    Hooks.on("chatMessage", handleInput);
    game.socket.on("module.toolkit", processCommand);
  });
})();
*/