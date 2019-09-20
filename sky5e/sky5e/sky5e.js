// @author Sky#9453
// @version 0.0.3
//
// 0.0.2 => 0.0.3 ~ Bugfix for tools not displaying properly 
//								~ Add shortsword to list of CONFIG.weapons
// 
// Special Thanks:
//	- DM Me Your Waifu (Discord: Fyorl#1292) for their assistance in getting the additional proficiencies to work properly.
//  - Kakaroto for helping with clickable known languages to chat
//	- Moerill for providing the Scrollbar Position saving code and dealing with my idiocy

CONFIG.tools = {
	"Artisan's Tool": "ARTISAN'S TOOLS",
	"Alchemist's Supplies": " - Alchemist's Supplies",
	"Brewer's Supplies	": " - Brewer's Supplies",
	"Calligrapher's Supplies	": " - Calligrapher's supplies",
	"Carpenter's Tools	": " - Carpenter's Tools",
	"Cartographer's Tools	": " - Cartographer's Tools",
	"Cobbler's Tools	": " - Cobbler's Tools",
	"Cook's Utensils	": " - Cook's Utensils",
	"Glassblower's Tools	": " - Glassblower's Tools",
	"Jeweler's Tools	": " - Jeweler's Tools",
	"Leatherworker's Tools	": " - Leatherworker's Tools",
	"Mason's Tools	": " - Mason's Tools",
	"Painter's supplies	": " - Painter's supplies",
	"Potter's Tools	": " - Potter's Tools",
	"Smith's Tools	": " - Smith's Tools",
	"Tinker's Tools	": " - Tinker's Tools",
	"Weaver's Tools	": " - Weaver's Tools",
	"Woodcarver's Tools	": " - Woodcarver's Tools",
	"Gaming Sets": "GAMING SETS",
	"Dice": " - Dice",
	"Dragonchess": " - Dragonchess",
	"Playing Cards": " - Playing Cards",
	"Three-Dragon Ante": " - Three Dragon Ante",
	"Musical Instrument": "MUSICAL INSTRUMENTS",
	"Bagpipes": " - Bagpipes",
	"Drum": " - Drum",
	"Dulcimer": " - Dulcimer",
	"Flute": " - Flute",
	"Lute": " - Lute",
	"Lyre	": " - Lyre	",
	"Horn": " - Horn",
	"Pan Flute": " - Pan Flute",
	"Shawm": " - Shawm",
	"Viol": " - Viol",
	"Other Tools": "OTHER TOOLS & KITS",
	"Disguise Kit": " - Disguise Kit",
	"Forgery Kit": " - Forgery Kit",
	"Herbalism Kit": " - Herbalism Kit",
	"Navigator's Tools": " - Navigator's Tools",
	"Poisoner's Kit": " - Poisoner's Kit",
	"Thieves' Tools": " - Thieves' Tools",
	"Vehicles (Air)": " - Vehicles (Air)",
	"Vehicles (Land)": " - Vehicles (Land)",
	"Vehicles (Water)": " - Vehicles (Water)"
};

CONFIG.armor = {
	"None": "None",
	"Light": "Light",
	"Medium": "Medium",
	"Heavy": "Heavy",
	"Shields": "Shields"
};

CONFIG.weapons = {
	"Simple": "Simple",
	"Martial": "Martial",
	"Battleaxe": "Battleaxe",
	"Blowgun": "Blowgun",
	"Boomerang": "Boomerang",
	"Club": "Club",
	"Dagger": "Dagger",
	"Dart": "Dart",
	"Flail": "Flail",
	"Glaive": "Glaive",
	"Greataxe": "Greataxe",
	"Greatclub": "Greatclub",
	"Greatsword": "Greatsword",
	"Halberd": "Halberd",
	"Hand Crossbow": "Hand Crossbow",
	"Handaxe": "Handaxe",
	"Heavy Crossbow": "Heavy Crossbow",
	"Javelin": "Javelin",
	"Lance": "Lance",
	"Light Crossbow": "Light Crossbow",
	"Light Hammer": "Light Hammer",
	"Longbow": "Longbow",
	"Longsword": "Longsword",
	"Mace": "Mace",
	"Maul": "Maul",
	"Morningstar": "Morningstar",
	"Net": "Net",
	"Pike": "Pike",
	"Quarterstaff": "Quarterstaff",
	"Rapier": "Rapier",
	"Scimitar": "Scimitar",
	"Shortbow": "Shortbow",
	"Shortsword": "Shortsword",
	"Sickle": "Sickle",
	"Sling": "Sling",
	"Spear": "Spear",
	"Trident": "Trider",
	"War Pick": "War Pick",
	"Warhammer": "Warhammer",
	"Whip": "Whip",
	"Yklwa": "Yklwa"
};

class Sky5eSheet extends ActorSheet5eCharacter {
	get template() {
		const path = "public/systems/dnd5e/templates/actors/";
		if ( !game.user.isGM && this.actor.limited ) return path + "limited-sheet.html";
		return "public/modules/sky5e/templates/sky5e-sheet.html";
	}
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('sky5e');
		mergeObject(options, {width: 900, height: 800});
		return options;
	}
	
	async _render(force = false, options = {}) {
		this.saveScrollPos();
		await super._render(force, options);
		this.setScrollPos();
	}

	saveScrollPos() {
		if (this.form === null) return;
		const html = $(this.form).parent();
		this.scrollPos = {
			top: html.scrollTop(),
			left: html.scrollLeft()
		}
	}

	setScrollPos() {
		if (this.form === null || this.scrollPos === undefined) return;
		const html = $(this.form).parent();
		html.scrollTop(this.scrollPos.top);
		html.scrollLeft(this.scrollPos.left);
	}
	
	getData() {
		const data = super.getData();
		if (data.actor.flags.sky5e === undefined) {
			const flags = {
				tools: { custom: "", label: "Tools", value: [] },
				armor: { custom: "", label: "Armor", value: [] },
				weapons: { custom: "", label: "Weapons", value: [] }
			};
			data.actor.flags.sky5e = flags;
			this.actor.update({'flags.sky5e': flags});
		}
		return data;
	}
	
	activateListeners(html) {
		super.activateListeners(html);
		html.find('.item-delete').off('click');

		html.find('.item-delete').click(ev => {
			let li = $(ev.currentTarget).parents('.item');
			let itemId = Number(li.attr('data-item-id'));
			new Dialog({
				title: 'Delete Confirmation',
				content: '<p>Are you sure you want to delete this item?</p>',
				buttons: {
					Yes: {
						icon: '<i class="fa fa-check"></i>',
						label: 'Yes',
						callback: dlg => {
							this.actor.deleteOwnedItem(itemId, true);
							li.slideUp(200, () => this.render(false));
						}
					},
					cancel: {
						icon: '<i class="fas fa-times"></i>',
						label: 'No'
					},
				},
				default: 'cancel'
			}).render(true);
		});
		
		// Ability Checks
    html.find('.ability-mod').click(event => {
      event.preventDefault();
      let ability = event.currentTarget.parentElement.getAttribute("data-ability");
      this.actor.rollAbilityTest(ability, {event: event});
    });
		
		// Ability Saves
    html.find('.ability-save').click(event => {
      event.preventDefault();
      let ability = event.currentTarget.parentElement.getAttribute("data-ability");
      this.actor.rollAbilitySave(ability, {event: event});
    });
		
		// Send Languages to Chat
    html.find('.sky-languages').click(event => {
      event.preventDefault();
			let langs = this.actor.data.data.traits.languages.value.map(l => CONFIG.languages[l] || l).join(", ");
			let content = `
				<div class="dnd5e chat-card item-card" data-acor-id="${this.actor._id}">
					<header class="card-header flexrow">
						<img src="${this.actor.data.token.img}" title="" width="36" height="36" style="border: none;"/>
						<h3>Known Languages</h3>
					</header>
					<div class="card-content">${langs}</div>
				</div>`;
			
			// Send content to chat
			let rollWhisper = null;
			let rollBlind = false;			
			let	rollMode = game.settings.get("core", "rollMode");
			if (["gmroll", "blindroll"].includes(rollMode)) rollWhisper = ChatMessage.getWhisperIDs("GM");
			if (rollMode === "blindroll") rollBlind = true;
			
			ChatMessage.create({
				user: game.user._id,
				content: content,
				speaker: { actor: this.actor._id, token: this.actor.token, alias: this.actor.name },
				type: CHAT_MESSAGE_TYPES.OTHER,
				whisper: rollWhisper,
				blind: rollBlind,
				sound: CONFIG.sounds.dice
			});
    });	
	}
}

Actors.registerSheet("dnd5e", Sky5eSheet, {
	types: ["character"],
	makeDefault: true
});