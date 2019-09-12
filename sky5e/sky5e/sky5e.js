// @author Sky#9453
// @version 0.0.1
// 
// Special Thanks to DM Me Your Waifu (Discord: Fyorl#1292) for their
// assistance in getting the additional proficiencies to work properly.

CONFIG.tools = {
	"Artisan's Tools": "Artisan's Tools",
	"Disguise Kit": "Disguise Kit",
	"Forgery Kit": "Forgery Kit",
	"Herbalism Kit": "Herbalism Kit",
	"Navigator's Tools": "Navigator's Tools",
	"Poisoner's Kit": "Poisoner's Kit",
	"Thieves' Tools": "Thieves' Tools",
	"Vehicles (Air)": "Vehicles (Air)",
	"Vehicles (Land)": "Vehicles (Land)",
	"Vehicles (Water)": "Vehicles (Water)"
};

CONFIG.armor = {
	"None": "None",
	"Light": "Light",
	"Medium": "Medium",
	"Heavy": "Heavy",
	"Shields": "Shields"
}

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
	"Sickle": "Sickle",
	"Sling": "Sling",
	"Spear": "Spear",
	"Trident": "Trider",
	"War Pick": "War Pick",
	"Warhammer": "Warhammer",
	"Whip": "Whip",
	"Yklwa": "Yklwa"
}

class Sky5eSheet extends ActorSheet5eCharacter {
	get template() {
		const path = "public/systems/dnd5e/templates/actors/";
		if ( !game.user.isGM && this.actor.limited ) return path + "limited-sheet.html";
		return "public/modules/sky5e/templates/sky5e-sheet.html";
	}
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push('sky5e');
		mergeObject(options, {
			width: 900,
			height: 800
		});
		return options;
	}
	
	getData() {
		const data = super.getData();
		if (data.actor.flags.sky5e === undefined) {
			const flags = {
				tools: {
					custom: "",
					label: "Tools",
					value: []
				},
				armor: {
					custom: "",
					label: "Armor",
					value: []
				},
				weapons: {
					custom: "",
					label: "Weapons",
					value: []
				}
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
						label: 'Cancel'
					},
				},
				default: 'Yes'
			}).render(true);
		});
	}
}

Actors.registerSheet("dnd5e", Sky5eSheet, {
	types: ["character"],
	makeDefault: true
});

Hooks.on('preCreateActor', (cls, data) => {
		if (data.flags === undefined) {
				data.flags = {};
		}
		data.flags.sky5e = {
			tools: {
				custom: "",
				label: "Tools",
				value: []
			},
			armor: {
				custom: "",
				label: "Armor",
				value: []
			},
			weapons: {
				custom: "",
				label: "Weapons",
				value: []
			}
		};
});
