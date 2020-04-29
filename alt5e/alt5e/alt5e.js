// Alt5eSheet
// @author Sky#9453
// @version 1.1.3
import { DND5E } from "../../systems/dnd5e/module/config.js";
import { Dice5e } from "../../systems/dnd5e/module/dice.js";
import { Actor5e } from "../../systems/dnd5e/module/actor/entity.js";
import { ActorSheet5eCharacter } from "../../systems/dnd5e/module/actor/sheets/character.js";
import { Item5e } from "../../systems/dnd5e/module/item/entity.js";
import { ItemSheet5e } from "../../systems/dnd5e/module/item/sheet.js";

/* Currently disabled so as not to break Better Rolls, Magic Items, etc
import { BetterRollsHooks } from "../../modules/betterrolls5e/scripts/hooks.js";
BetterRollsHooks.addItemSheet("AltItemSheet5e");
export class AltItemSheet5e extends ItemSheet5e {
	static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
			classes: ["alt5e", "dnd5e", "sheet", "item"],
      resizable: true
    });
  }
	
	setPosition (...args) {
		return Application.prototype.setPosition.call(this, ...args);
	}
}
*/

export class Alt5eSheet extends ActorSheet5eCharacter {
	get template() {
		if ( !game.user.isGM && this.actor.limited && game.settings.get("alt5e", "useExpandedSheet")) return "modules/alt5e/templates/expanded-limited-sheet.html";
		if ( !game.user.isGM && this.actor.limited ) return "modules/alt5e/templates/limited-sheet.html";
		return "modules/alt5e/templates/alt5e-sheet.html";
	}
	
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
			classes: ["alt5e", "dnd5e", "sheet", "actor", "character"],
			blockFavTab: true,
			width: 800
		});
	}
	
	async _render(force = false, options = {}) {
		this.saveScrollPos();
		await super._render(force, options);
		this.setScrollPos();
	}
	
	saveScrollPos() {
		if (this.form === null) return;
		const html = $(this.form);
		this.scrollPos = {
			top: html.scrollTop(),
			left: html.scrollLeft()
		}
	}
	
	setScrollPos() {
		if (this.form === null || this.scrollPos === undefined) return;
		const html = $(this.form);
		html.scrollTop(this.scrollPos.top);
		html.scrollLeft(this.scrollPos.left);
	}
	
	_createEditor(target, editorOptions, initialContent) {
		editorOptions.min_height = 200;
		super._createEditor(target, editorOptions, initialContent);
	}
	
	activateListeners(html) {
		super.activateListeners(html);
		
		// Add Rollable CSS Class to Languages
		html.find('[for="data.traits.languages"]').addClass("rollable");
		
		// Send Languages to Chat onClick
		html.find('[for="data.traits.languages"]').click(event => {
			event.preventDefault();
			let langs = this.actor.data.data.traits.languages.value.map(l => DND5E.languages[l] || l).join(", ");
			let custom = this.actor.data.data.traits.languages.custom;
			if (custom) langs += ", " + custom.replace(/;/g, ",");
			let content = `
				<div class="dnd5e chat-card item-card" data-acor-id="${this.actor._id}">
					<header class="card-header flexrow">
						<img src="${this.actor.data.token.img}" title="" width="36" height="36" style="border: none;"/>
						<h3>Known Languages</h3>
					</header>
					<div class="card-content">${langs}</div>
				</div>
			`;
			
			// Send to Chat
			let rollWhisper = null;
			let rollBlind = false;
			let rollMode = game.settings.get("core", "rollMode");
			if (["gmroll", "blindroll"].includes(rollMode)) rollWhisper = ChatMessage.getWhisperIDs("GM");
			if (rollMode === "blindroll") rollBlind = true;
			ChatMessage.create({
				user: game.user._id,
				content: content,
				speaker: {
					actor: this.actor._id,
					token: this.actor.token,
					alias: this.actor.name
				},
				type: CONST.CHAT_MESSAGE_TYPES.OTHER
			});
		});
		
		// Item Delete Confirmation
		html.find('.item-delete').off("click");
		html.find('.item-delete').click(event => {
			let li = $(event.currentTarget).parents('.item');
			let itemId = li.attr("data-item-id");
			let item = this.actor.getOwnedItem(itemId);
			new Dialog({
				title: `Deleting ${item.data.name}`,
				content: `<p>Are you sure you want to delete ${item.data.name}?</p>`,
				buttons: {
					Yes: {
						icon: '<i class="fa fa-check"></i>',
						label: 'Yes',
						callback: dlg => {
							this.actor.deleteOwnedItem(itemId);
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
	}
}

async function injectPassives(app, html, data) {
	// let observant = (data.actor.items.some( i => i.name.toLowerCase() === "observant")) ? 5 : 0;
	let sentinel_shield = (data.actor.items.some( i => i.name.toLowerCase() === "sentinel shield" && i.data.equipped)) ? 5 : 0;
	let passivesTarget = html.find('input[name="data.traits.senses"]').parent();
	let passives = "";
	let tagStyle = "text-align: center; min-width: unset; font-size: 13px;";
	if (game.settings.get("alt5e", "showPassiveInsight")) {
		let passiveInsight = data.data.skills.ins.passive;
		passives += `
			<div class="form-group">
				<label>Passive Insight</label>
				<ul class="traits-list">
					<li class="tag" style="${tagStyle}">${passiveInsight}</li>
				</ul>
			</div>
		`;
	};
	if (game.settings.get("alt5e", "showPassiveInvestigation")) {
		let passiveInvestigation = data.data.skills.inv.passive;
		passives += `
			<div class="form-group">
				<label>Passive Investigation</label>
				<ul class="traits-list">
					<li class="tag" style="${tagStyle}">${passiveInvestigation}</li>
				</ul>
			</div>
		`;
	};
	if (game.settings.get("alt5e", "showPassivePerception")) {
		let passivePerception = data.data.skills.prc.passive + sentinel_shield;
		data.data.skills.prc.passive = 10 + data.data.skills.prc.mod + sentinel_shield;
		passives += `
			<div class="form-group">
				<label>Passive Perception</label>
				<ul class="traits-list">
					<li class="tag" style="${tagStyle}">${passivePerception}</li>
				</ul>
			</div>
		`;
	};
	if (game.settings.get("alt5e", "showPassiveStealth")) {
		let passiveStealth = data.data.skills.ste.passive;
		passives += `
			<div class="form-group">
				<label>Passive Stealth</label>
				<ul class="traits-list">
					<li class="tag" style="${tagStyle}">${passiveStealth}</li>
				</ul>
			</div>
		`;
	};
	passivesTarget.after(passives);
}

// The following function is adapted for the Alt5eSheet from the Favorites Item
// Tab Module created for Foundry VTT - by Felix Müller (Felix#6196 on Discord).
// It is licensed under a Creative Commons Attribution 4.0 International License
// and can be found at https://github.com/syl3r86/favtab.

async function addFavorites(app, html, data) {
	let favItems = [];
	let favFeats = [];
	let favSpells = {
		0: { isCantrip: true, spells: [] },
		1: { spells: [], value: data.actor.data.spells.spell1.value, max: data.actor.data.spells.spell1.max },
		2: { spells: [], value: data.actor.data.spells.spell2.value, max: data.actor.data.spells.spell2.max },
		3: { spells: [], value: data.actor.data.spells.spell3.value, max: data.actor.data.spells.spell3.max },
		4: { spells: [], value: data.actor.data.spells.spell4.value, max: data.actor.data.spells.spell4.max },
		5: { spells: [], value: data.actor.data.spells.spell5.value, max: data.actor.data.spells.spell5.max },
		6: { spells: [], value: data.actor.data.spells.spell6.value, max: data.actor.data.spells.spell6.max },
		7: { spells: [], value: data.actor.data.spells.spell7.value, max: data.actor.data.spells.spell7.max },
		8: { spells: [], value: data.actor.data.spells.spell8.value, max: data.actor.data.spells.spell8.max },
		9: { spells: [], value: data.actor.data.spells.spell9.value, max: data.actor.data.spells.spell9.max }
	}
	
	let spellCount = 0
	let items = data.actor.items;
	for (let item of items) {
		if (item.type == "class") continue;
		if (item.flags.favtab === undefined || item.flags.favtab.isFavourite === undefined) {
			item.flags.favtab = { isFavourite: false };
		}
		let isFav = item.flags.favtab.isFavourite;
		if (app.options.editable) {
			let favBtn = $(`<a class="item-control item-fav" data-fav="${isFav}" title="${isFav ? "Remove from Favourites" : "Add to Favourites"}"><i class="fas ${isFav ? "fa-star" : "fa-sign-in-alt"}"></i></a>`);
			favBtn.click(ev => {
				app.actor.getOwnedItem(item._id).update({
					"flags.favtab.isFavourite": !item.flags.favtab.isFavourite
				});
			});
			html.find(`.item[data-item-id="${item._id}"]`).find('.item-controls').prepend(favBtn);
		}
		
		if (isFav) {
			item.spellComps = "";
			if (item.data.components) {
				let comps = item.data.components;
				let v = (comps.vocal) ? "V" : "";
				let s = (comps.somatic) ? "S" : "";
				let m = (comps.material) ? "M" : "";
				let c = (comps.concentration) ? true : false;
				let r = (comps.ritual) ? true : false;
				item.spellComps = `${v}${s}${m}`;
				item.spellCon = c;
				item.spellRit = r;
			}
			
			item.editable = app.options.editable;
			switch (item.type) {
			case 'feat':
				if (item.flags.favtab.sort === undefined) {
					item.flags.favtab.sort = (favFeats.count + 1) * 100000; // initial sort key if not present
				}
				favFeats.push(item);
				break;
			case 'spell':
				if (item.data.preparation.mode) {
					item.spellPrepMode = ` (${CONFIG.DND5E.spellPreparationModes[item.data.preparation.mode]})`
				}
				if (item.data.level) {
					favSpells[item.data.level].spells.push(item);
				} else {
					favSpells[0].spells.push(item);
				}
				spellCount++;
				break;
			default:
				if (item.flags.favtab.sort === undefined) {
					item.flags.favtab.sort = (favItems.count + 1) * 100000; // initial sort key if not present
				}
				favItems.push(item);
				break;
			}
		}
	}
	
	// Alter core CSS to fit new button
	if (app.options.editable) {
		html.find('.spellbook .item-controls').css('flex', '0 0 88px');
		html.find('.inventory .item-controls, .features .item-controls').css('flex', '0 0 90px');
		html.find('.favourite .item-controls').css('flex', '0 0 22px');
	}
	
	let tabContainer = html.find('.favtabtarget');
	data.favItems = favItems.length > 0 ? favItems.sort((a, b) => (a.flags.favtab.sort) - (b.flags.favtab.sort)) : false;
	data.favFeats = favFeats.length > 0 ? favFeats.sort((a, b) => (a.flags.favtab.sort) - (b.flags.favtab.sort)) : false;
	data.favSpells = spellCount > 0 ? favSpells : false;
	data.editable = app.options.editable;
	
	await loadTemplates(['modules/alt5e/templates/item.hbs']);
	let favtabHtml = $(await renderTemplate('modules/alt5e/templates/template.hbs', data));
	favtabHtml.find('.item-name h4').click(event => app._onItemSummary(event));
	
	if (app.options.editable) {
		favtabHtml.find('.item-image').click(ev => app._onItemRoll(ev));
		let handler = ev => app._onDragItemStart(ev);
		favtabHtml.find('.item').each((i, li) => {
			if (li.classList.contains("inventory-header")) return;
			li.setAttribute("draggable", true);
			li.addEventListener("dragstart", handler, false);
		});
		//favtabHtml.find('.item-toggle').click(event => app._onToggleItem(event));
		favtabHtml.find('.item-edit').click(ev => {
			let itemId = $(ev.target).parents('.item')[0].dataset.itemId;
			app.actor.getOwnedItem(itemId).sheet.render(true);
		});
		favtabHtml.find('.item-fav').click(ev => {
			let itemId = $(ev.target).parents('.item')[0].dataset.itemId;
			let val = !app.actor.getOwnedItem(itemId).data.flags.favtab.isFavourite
			app.actor.getOwnedItem(itemId).update({
				"flags.favtab.isFavourite": val
			});
		});
		
		// Sorting
		favtabHtml.find('.item').on('drop', ev => {
			ev.preventDefault();
			ev.stopPropagation();
			
			let dropData = JSON.parse(ev.originalEvent.dataTransfer.getData('text/plain'));
			if (dropData.actorId !== app.actor.id || dropData.data.type === 'spell') return;
			let list = null;
			if (dropData.data.type === 'feat') list = favFeats;
			else list = favItems;
			let dragSource = list.find(i => i._id === dropData.data._id);
			let siblings = list.filter(i => i._id !== dropData.data._id);
			let targetId = ev.target.closest('.item').dataset.itemId;
			let dragTarget = siblings.find(s => s._id === targetId);
			
			if (dragTarget === undefined) return;
			const sortUpdates = SortingHelpers.performIntegerSort(dragSource, {
				target: dragTarget,
				siblings: siblings,
				sortKey: 'flags.favtab.sort'
			});
			const updateData = sortUpdates.map(u => {
				const update = u.update;
				update._id = u.target._id;
				return update;
			});
			app.actor.updateManyEmbeddedEntities("OwnedItem", updateData);
		});
	}
	tabContainer.append(favtabHtml);
	try {
		if (game.modules.get("betterrolls5e") && game.modules.get("betterrolls5e").active) BetterRolls.addItemContent(app.object, favtabHtml, ".item .item-name h4", ".item-properties", ".item > .rollable div");
	} 
	catch (err) {
		// Better Rolls not found!
	}
	Hooks.callAll("renderedAlt5eSheet", app, html, data);
}

Actors.registerSheet("dnd5e", Alt5eSheet, {
	types: ["character"],
	makeDefault: true
});

//Items.registerSheet("dnd5e", AltItemSheet5e, {
//	makeDefault: false
//});

Hooks.on("renderAlt5eSheet", (app, html, data) => {
	injectPassives(app, html, data);
	addFavorites(app, html, data);
});

Hooks.once("ready", () => {
	game.settings.register("alt5e", "useExpandedSheet", {
		name: "Expanded View for the Limited Sheet",
		hint: "The expanded view for the limited sheet displays the entire character sheet (minus the Private Notes tab) to players with Limited permission for that actor.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("alt5e", "showPassiveInsight", {
		name: "Show Passive Insight",
		hint: "Show the passive insight score in Traits.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("alt5e", "showPassiveInvestigation", {
		name: "Show Passive Investigation",
		hint: "Show the passive investigation score in Traits.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	game.settings.register("alt5e", "showPassivePerception", {
		name: "Show Passive Perception",
		hint: "Show the passive perception score in Traits.",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("alt5e", "showPassiveStealth", {
		name: "Show Passive Stealth",
		hint: "Show the passive stealth score in Traits.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
});