// Alt5eSheet
// @author Sky#9453
// @version 0.0.1
import { DND5E } from "../../systems/dnd5e/module/config.js";
import { Dice5e } from "../../systems/dnd5e/module/dice.js";
import { Actor5e } from "../../systems/dnd5e/module/actor/entity.js";
import { ActorSheet5eCharacter } from "../../systems/dnd5e/module/actor/sheets/character.js";
import { Item5e } from "../../systems/dnd5e/module/item/entity.js";
import { ItemSheet5e } from "../../systems/dnd5e/module/item/sheet.js";

export class Alt5eSheet extends ActorSheet5eCharacter {
	get blockFavTab() {
		return true;
	}
	
	get template() {
		if ( !game.user.isGM && this.actor.limited ) return super.template;
		return "modules/alt5e/templates/alt5e-sheet.html";
	}
	
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
			classes: ["alt5e", "dnd5e", "sheet", "actor", "character"],
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
		
		// Roll a Death Save
		html.find('.deathsave').click(event => {
			console.log(event);
			event.preventDefault();
			let roll = new Roll("1d20").roll();
			let result = roll.total;
			let message = `
			<div class="dnd5e chat-card item-card">
				<header class="card-header flexrow">
					<h3 style="line-height: unset; margin: auto 0px;">${this.actor.name} rolls ${result} on their death save.</h3>
				</header>
			</div>
			`;
			ChatMessage.create({
				user: game.user._id,
				speaker: {
					actor: this.actor._id,
					token: this.actor.token,
					alias: this.actor.name
				},
				content: message,
				type: CONST.CHAT_MESSAGE_TYPES.OTHER,
				sound: CONFIG.sounds.dice
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

// The following functions are adapted for the Alt5eSheet from the Favorites Item
// Tab Module created for Foundry VTT - by Felix Müller (Felix#6196 on Discord).
// It is licensed under a Creative Commons Attribution 4.0 International License
// and can be found at https://github.com/syl3r86/favtab.
function addFavorites(app, html, data) {
	let olStyle = `style="list-style-type:none; padding-left: 0px; list-style-type: none; margin: 5px -5px 0px -4px;"`;
	let favTabBtn = $('<a class="item" data-tab="favourite"><i class="fas fa-star"></i></a>');
	let favTabDiv = $('<div class="inventory-list favourite" data-group="primary" data-tab="favourite"></div>');
	let favItemOl = $(`<ol class="fav-item" ${olStyle}></ol>`);
	let favFeatOl = $(`<ol class="fav-feat" ${olStyle}></ol>`);
	let favSpellOl = $(`<ol class="fav-spell" ${olStyle}></ol>`);
	let favItems = [];
	let favFeats = [];
	let favSpells = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] }
	
	let items = data.actor.items;
	for (let item of items) {
		if (item.type == "class") continue;
		if (item.flags.favtab === undefined || item.flags.favtab.isFavourite === undefined) item.flags.favtab = { isFavourite: false };
		let isFav = item.flags.favtab.isFavourite;
		if (app.options.editable) {
			let favBtn = $(`<a class="item-control item-fav" data-fav="${isFav}" title="${isFav ? "remove from favourites" : "add to favourites"}"><i class="fas ${isFav ? "fa-star" : "fa-sign-in-alt"}"></i></a>`);
			favBtn.click(ev => {
				app.actor.getOwnedItem(item._id).update({
					"flags.favtab.isFavourite": !item.flags.favtab.isFavourite
				});
			});
			html.find(`.item[data-item-id="${item._id}"]`).find('.item-controls').prepend(favBtn);
		}

		if (isFav) {
			switch (item.type) {
			case 'feat':
				favFeats.push(item);
				break;
			case 'spell':
				if (item.data.level) {
					favSpells[item.data.level].push(item);
				} else {
					favSpells[0].push(item);
				}
				break;
			default:
				favItems.push(item);
				break;
			}
		}
	}

	// Create Items List
	if (favItems.length >= 1) {
		let itemHeader = $(`<li class="item inventory-header"><h3>Items</h3></li>`);
		favItemOl.append(itemHeader);
		for (let item of favItems) {
			let itemLi = createItemElement(item, app, html, data);
			favItemOl.append(itemLi);
		}
	}

	// Create Feats List
	if (favFeats.length >= 1) {
		let itemHeader = $(`<li class="item inventory-header"><h3>Feats</h3></li>`);
		favFeatOl.append(itemHeader);
		for (let item of favFeats) {
			let itemLi = createItemElement(item, app, html, data);
			favFeatOl.append(itemLi);
		}
	}

	// Create Spell List
	for (let spellLvl in favSpells) {
		if (favSpells[spellLvl].length >= 1) {
			let itemHeader = '';
			if (spellLvl === '0') {
				itemHeader = $(`<li class="item inventory-header"><h3>Cantrips</h3></li>`);
			} else {
				let spellslot = data.actor.data.spells['spell' + spellLvl].value;
				let spellMax = data.actor.data.spells['spell' + spellLvl].max;
				let inputStyle = 'style="height:1em; width:2em; margin:0 1px; padding:0; text-align:center;"';
				itemHeader = `<li class="item inventory-header flexrow">`;
				itemHeader += `<h3>Spell Level ${spellLvl}</h3>`;
				itemHeader += `<span class="spell-slots" style="display:inline; margin-left:10px;">`;
				itemHeader += `<input type="text" ${inputStyle} data-target="data.spells.spell${spellLvl}.value" value="${spellslot}" placeholder="0"/>`;
				itemHeader += `/`;
				itemHeader += `<input type="text" ${inputStyle} data-target="data.spells.spell${spellLvl}.max" value="${spellMax}" placeholder="0"/>`;
				itemHeader += `</span>`;
				itemHeader += `</li>`;
				itemHeader = $(itemHeader);
				
				// Spell Slot Handler
				itemHeader.find('input').change(ev => {
					let target = ev.target.dataset.target;
					$(html.find(`input[name="${target}"]`)).val(ev.target.value).trigger('submit', ev);
					openFavouriteTab(app, html, data);
				});
			}
			
			favSpellOl.append(itemHeader);
			for (let item of favSpells[spellLvl]) {
				let itemLi = createItemElement(item, app, html, data);
				favSpellOl.append(itemLi);
			}
		}
	}
	
	// Modify Existing CSS to Accomodate the Add/Remove to/from Favorites Button
	if (app.options.editable) {
		html.find('.spellbook .item-controls').css('flex', '0 0 88px');
		html.find('.inventory .item-controls, .features .item-controls').css('flex', '0 0 66px');
		html.find('.favourite .item-controls').css('flex', '0 0 22px');
	}
	
	// Finish Creating the Favorites Div and Append to the Favorites Container Div
	let tabContainer = html.find('.favtabtarget');
	favTabDiv.append(favItemOl);
	favTabDiv.append(favFeatOl);
	favTabDiv.append(favSpellOl);
	tabContainer.append(favTabDiv);
}

// Creates the Favorited Item
function createItemElement(item, app, html, data) {
	let itemLi = `<li class="item flexrow fav-item" data-item-id="${item._id}" draggable="true">`
	itemLi += `<div class="item-name flexrow rollable">`;
	itemLi += `<div class="item-image" style="background-image: url(${item.img})"></div>`;
	itemLi += `<h4>${item.name}</h4 >`;
	itemLi += `</div>`;
	itemLi += `<div class="uses" style="flex:0 0 80px; text-align: right; padding-right: 5px;">`;
	if (item.data.uses !== undefined && ((item.data.uses.value !== undefined && item.data.uses.value !== 0) || (item.data.uses.max !== undefined && item.data.uses.max !== 0))) {
		let inputStyle = 'style="height:1em; width:2em; margin:0 1px; padding:0; text-align:center;"';
		itemLi += `<span style="display:inline;">(</span>`;
		itemLi += `<input data-type="value" type="text" ${inputStyle} value="${item.data.uses.value}" ${app.options.editable ? "" : "disabled"}>`;
		itemLi += `<span style="display:inline;">/</span>`;
		itemLi += `<input data-type="max" type="text" ${inputStyle} value="${item.data.uses.max}" ${app.options.editable ? "" : "disabled"}>`;
		itemLi += `<span style="display:inline;">)</span>`;
	} else {
		if (app.options.editable) itemLi += `<a class="addCharges" value="Add Charges" title="Add Charges" style="text-align: right;"><i class="fas fa-plus"></i></a>`;
	}
	itemLi += `</div>`;
	itemLi += `<div class="item-controlls" style="flex:0 0 44px;">`;
	itemLi += `<a class="item-control item-edit" title="Edit Item" > <i class="fas fa-edit" ></i ></a >`;
	itemLi += `<a class="item-control item-fav" title="remove from favourites" > <i class="fas fa-sign-out-alt" ></i ></a >`;
	itemLi += `</div>`;
	itemLi += `</li>`;
	itemLi = $(itemLi);
	itemLi.find('.item-name h4').click(event => app._onItemSummary(event));
	if (!app.options.editable) return itemLi;
	itemLi.find('.item-image').click(event => app._onItemRoll(event));
	itemLi.find('.item-edit').click(event => { app.actor.getOwnedItem(item._id).sheet.render(true); });
	itemLi.find('.item-fav').click(ev => { app.actor.getOwnedItem(item._id).update({"flags.favtab.isFavourite": !item.flags.favtab.isFavourite});});
	itemLi.find('.uses input').change(ev => {
		let path = `data.uses.` + ev.target.dataset.type;
		let obj = {};
		obj[path] = Number(ev.target.value);
		app.actor.getOwnedItem(item._id).update(obj);
	})
	
	// Create Charges for Item
	itemLi.find('.addCharges').click(ev => {
		item.data.uses = { value: 1, max: 1 };
		app.actor.updateOwnedItem(item);
	});

	// Show/Hide Add Charges Button
	itemLi.find('.addCharges').hide();
	itemLi.hover(evIn => {
		itemLi.find('.addCharges').show();
	}, evOut => {
		itemLi.find('.addCharges').hide();
	});
	return itemLi;
}

Actors.registerSheet("dnd5e", Alt5eSheet, {
	types: ["character"],
	makeDefault: true
});

Hooks.on(`renderAlt5eSheet`, (app, html, data) => {
	addFavorites(app, html, data);
});