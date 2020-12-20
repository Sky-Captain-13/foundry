const DM_Toolkit = (() => {
  // VERSION INFORMATION
  const DMToolkit_Author = "Sky";
  const DMToolkit_Version = "2.2.1";
  const DMToolkit_LastUpdated = 1608497645; //Date.now().toString().substr(0, 10)
  
  // FUNCTIONS
  const activateListeners = function() {
    $(document.getElementById('chat-log')).on('click', '.toolkit-chat', (event) => {
      event.preventDefault();
      let roll = $(event.currentTarget);
      let tip = roll.parent().parent().find(".message-header");
      if (!tip.is(":visible")) {
        roll[0].style.margin = '0px -7px -7px -7px';
        tip.slideDown(0);
      } else {
        roll[0].style.margin = '-7px';
        tip.slideUp(0);
      }
    });
  }
  
  const addGridBorder = function() {
    const border = canvas.grid.addChild(new PIXI.Graphics());
    border.lineStyle(1.0, colorStringToHex(canvas.scene.data.gridColor), canvas.scene.data.gridAlpha).drawRect(0, 0, canvas.dimensions.width, canvas.dimensions.height);
  }
  
  const addProficiency = (actor, item, sheet, id) => {
    if (item.type === "weapon" || item.type === "armor") actor.updateOwnedItem({ _id: item._id, "data.proficient": true });
    if (item.type === "tool") actor.updateOwnedItem({ _id: item._id, "data.proficient": 1 });
  }
  
  const adjustTokenHP = async function(changeType, amount, chatAnnounceOverride = true) {
    let count = 0;
    const promises = [];
      for ( let token of canvas.tokens.controlled ) {
        let message = "";
        let actor = token.actor;
        let hp = actor.data.data.attributes.hp;
        let roll = new Roll(amount).roll();
        let hpChange = Math.abs(roll.total);
        let tooltip = [];
        roll.terms.forEach(function (term) {
          if (term.results != undefined) tooltip.push(`(${term.results.flatMap((die) => die.discarded ? [] : die.result).join(" + ")})`);
          else tooltip.push(term);
        });
        
        count += 1;
        if (changeType === "Healing" || changeType === "Potion") {
          promises.push(token.actor.update({
            "data.attributes.hp.value": Math.min(hp.value + hpChange, hp.max)
          }));
          let healType = (changeType === "Healing") ? "is healed for" : "drinks a potion and is healed for";
          let plural = (hpChange != 1) ? "s" : "";
          
          // HEALING MESSAGE
          message = `
          <div class="toolkit-chat dmtk msg-style heal" title="${amount} = ${tooltip.join(" ")}">
            <div class="dmtk imgbg-style">
              <img class="dmtk img-style" src="${actor.data.token.img}" />
            </div>
            ${token.data.name} ${healType} ${hpChange} hit point${plural}.
          </div>`;
        } else {
          let temphp = parseInt(hp.temp) || 0;
          let damage = Math.max(hpChange - temphp, 0);
          temphp = (temphp === 0) ? "" : Math.max(temphp - hpChange, 0);
          let curhp = Math.max(hp.value - damage, 0);
          let deathmsg = (curhp <= 0) ? " and has been slain!" : ".";
          promises.push(token.actor.update({
            "data.attributes.hp.temp": temphp,
            "data.attributes.hp.value": curhp
          }));
          
          // DAMAGE & DEATH MESSAGE
          message = `
          <div class="toolkit-chat dmtk msg-style damage" title="${amount} = ${tooltip.join(" ")}">
            <div class="dmtk imgbg-style">
              <img class="dmtk img-style" src="${actor.data.token.img}" />
            </div>
            ${token.data.name} takes ${hpChange} damage${deathmsg}
          </div>`;
        }
        
        // ANNOUNCE TO CHAT
        if (game.settings.get("dm_toolkit", "announceToChat") && chatAnnounceOverride) {
          ChatMessage.create({
            user: game.user._id,
            speaker: { alias: "" },
            content: message,
            sound: (count <= 1) ? CONFIG.sounds.dice : ""
          });
        }
      }
    return Promise.all(promises);
  }
  
  const checkActorStatus = async function(actorData, changed, options, id) {
    if (game.userId !== id) return;
    if (changed?.data?.attributes?.hp !== undefined) {
      let token = canvas.tokens.placeables.filter(t => (t.data.actorId === actorData.id))[0];
      let hp = actorData.data.data.attributes.hp;
      await checkStatus(token, hp);
      // console.warn(`${actor.name}'s Hit Points: ${hp.value} / ${hp.max}`);
    }
  }
  
  const checkTokenStatus = async function(scene, tokenData, changed, options, id) {
    if (game.userId !== id) return;
    if (changed?.actorData?.data?.attributes?.hp !== undefined) {
      let token = canvas.tokens.get(tokenData._id);
      let hp = token.actor.data.data.attributes.hp;
      await checkStatus(token, hp);
      // console.warn(`${token.name}'s Hit Points: ${hp.value} / ${hp.max}`);
    }
  }
  
  const checkStatus = async function(token, hp) {
    // Get the ActiveEffects objects for bloodied, dead, and prone
    let bloodied = CONFIG.statusEffects.find(effect => (effect.id === "bloodied"));
    let dead = CONFIG.statusEffects.find(effect => (effect.id === "dead"));
    let prone = CONFIG.statusEffects.find(effect => (effect.id === "prone"));
    
    // Determine if the creature is already bloodied, dead, or prone
    let active = token.actor.effects.map(fx => fx.data.label.toLowerCase());
    let isBloodied = active.includes("bloodied");
    let isDead = active.includes("dead");
    let isProne = active.includes("prone");
    
    // REMOVE DEAD
    if (isDead && (hp.value) > 0 && dead) {
      isDead = false;
      await token.toggleEffect(dead);
    }
    
    // REMOVE BLOODIED
    if (isBloodied && (hp.value) >= (hp.max/2) && bloodied) {
      isBloodied = false;
      await token.toggleEffect(bloodied);
    }
    
    // ADD BLOODIED
    if (!isBloodied && (hp.value) > 0 && (hp.value) < (hp.max/2) && bloodied) {
      isBloodied = true;
      await token.toggleEffect(bloodied);
    }
    
    // REMOVE BLOODIED, ADD DEAD, ADD PRONE
    if (hp.value <= 0 && token.actor?.data?.type === "character") {
      if (isBloodied && bloodied) await token.toggleEffect(bloodied);
      if (!isDead && dead) await token.toggleEffect(dead);
      if (!isProne && prone) await token.toggleEffect(prone);
    } else if (hp.value <= 0 && token.actor?.data?.type === "npc") {
      if (isBloodied && bloodied) await token.toggleEffect(bloodied);
      if (dead) await token.toggleEffect(dead, {overlay: true});
      if (!isProne && prone) await token.toggleEffect(prone);
    }
  }
  
  const deleteOwnToken = function(data) {
    if (game.user.id == data.activeGM) canvas.tokens.deleteMany(data.ids);
  }
  
  const handleInput = function(msg, chatData) {
    if (chatData.charAt(0) === "!") {
      let command = chatData.split(" ")[0].trim();
      let args = chatData.replace(command, "").trim();
      //let userID = game.user.id;
      //let selected = canvas.tokens.controlled.map(a => a.data._id);
      //let targeted = Array.from(game.user.targets).map(a => a.data._id);
      
      // !heal|damage applies damage or healing to the selected tokens
      if (command === "!heal" || command === "!damage" || command === "!dmg") {
        if (canvas.tokens.controlled.length == 0) {
          ui.notifications.error("You must select one or more tokens before using this command.");
          return false;
        }
        let changeType = (command === "!heal") ? "Healing" : "Damage";
        if (args !== "") {
          adjustTokenHP(changeType, args);
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
                if (applyChange) adjustTokenHP(changeType, html.find('[name="hpChange"]')[0].value);
              }
            }).render(true);
            setTimeout(function() { document.getElementById("dmtk_alterhp").focus(); }, 100);
          }, 100);
        }
        return false;
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
              checkText = `[${features}] Ruins ${direction[directionCheck]}.`;
            } else if (featureRoll >= 4 && featureRoll <= 6) {
              // CAVES
              checkText = `[${features}] A cave ${direction[directionCheck]}.`;
            } else if (featureRoll >= 7 && featureRoll <= 9) {
              // NATURAL FEATURE
              checkText = `[${features}] An interesting natural feature ${direction[directionCheck]}.`;
            } else if (featureRoll >= 10 && featureRoll <= 11) {
              // LAIR
              checkText = `[${features}] The lair of a dangerous foe ${direction[directionCheck]}.`;
            } else if (featureRoll >= 12 && featureRoll <= 14) {
              // CAMPSITE
              checkText = `[${features}] A campsite ${direction[directionCheck]}.`;
            } else if (featureRoll >= 15 && featureRoll <= 16) {
              // SETTLEMENT
              checkText = `[${features}] Signs of a nearby settlement ${direction[directionCheck]}.`;
            } else if (featureRoll >= 17 && featureRoll <= 19) {
              // UNUSUAL TERRAIN
              checkText = `[${features}] A pocket of land that is wildly different from the surrounding area, has abundant forage, or is of an unusual type ${direction[directionCheck]}.`;
            } else {
              // MAGICAL FEATURE
              checkText = `[${features}] A magical feature ${direction[directionCheck]}.`;
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
          whisper: game.users.entities.filter(u => u.isGM).map(u => u._id),
          content: msgToChat,
          type: CONST.CHAT_MESSAGE_TYPES.OTHER,
          sound: ""
        });
        return false;
      }
      
      // Use a Potion of Healing
      if (command === "!potion") {
        if (canvas.tokens.controlled.length == 0) {
          ui.notifications.error("You must select one or more tokens before using this command.");
          return false;
        }
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
              if (applyChange) adjustTokenHP("Potion", amount = html.find('[name="potionRoll"]')[0].value);
            }
          }).render(true);
          setTimeout(function() { document.getElementById("dmtk_potions").focus(); }, 100);
        }, 100);
        return false;
      }
      
      // Resets a token to max hp, removes temp hp, and remove any status icons.
      if (command === "!reset") {
        ( async ()=> {
          for ( let token of canvas.tokens.controlled ) {
            let fx = token.actor.data.effects.filter(e => e.flags?.core?.statusId);
            for (let f of fx) {
              let existing = CONFIG.statusEffects.find(effect => (effect.icon === f.icon))
              await token.toggleEffect(existing);
            }
            await token.actor.applyDamage(0 - token.actor.data.data.attributes.hp.max);
          }
        })();
        return false;
      }
    }
  };
    
  const hideCardHeader = function(msg, html, data) {
    if (html.find(".toolkit-chat").length) html.find(".message-header").hide();
  }
  
  const resolveHiddenToken = function(messageData) {
    if (!game.user.isGM) return;
    const speaker = messageData.speaker;
    if (!speaker) return;
    const token = canvas.tokens.get(speaker.token);
    if (token && token.data.hidden) {
      messageData.whisper = ChatMessage.getWhisperRecipients("GM");
    }
  }
  
  const resolvePCToken = function(messageData) {
    // console.log(messageData);
    if (!game.user.isGM) return;
    const speaker = messageData.speaker;
    if (!speaker) return;
    const token = canvas.tokens.get(speaker.token);
    if (!messageData.roll && token?.actor?.hasPlayerOwner) {
      messageData.speaker = {};
      messageData.speaker.alias = game.users.get(messageData.user).name;
      messageData.type = CONST.CHAT_MESSAGE_TYPES.OOC;
    }
  }
  
  const resolvePreCreateMessage = function(messageData) {
    resolveHiddenToken(messageData);
    resolvePCToken(messageData); 
  }
  
  // HOOKS
  Hooks.on("ready", function() {
    activateListeners();
    game.socket.on("module.dm_toolkit", deleteOwnToken);    
    console.log("-=> DMToolkit v" + DMToolkit_Version + " <=- [" + (new Date(DMToolkit_LastUpdated * 1000)) + "]");
  });
  
  Hooks.on("canvasReady", addGridBorder);
  Hooks.on("chatMessage", handleInput);
  Hooks.on("createOwnedItem", addProficiency);
  Hooks.on("preCreateChatMessage", resolvePreCreateMessage);
  Hooks.on("renderChatMessage", hideCardHeader);
  Hooks.on("updateActor", checkActorStatus);
  Hooks.on("updateToken", checkTokenStatus);
  
  Hooks.once("ready", function() {
    // TOOLKIT CONFIGURATION SETTINGS
    game.settings.register("dm_toolkit", "announceToChat", {
      name: "Announce HP Changes to Chat",
      hint: "This option will enable or disable the announcement of healing or damage to tokens using !heal or !damage.",
      scope: "world",
      config: true,
      default: "true",
      type: Boolean
    });
    
    game.settings.register("dm_toolkit", "autoUnpause", {
      name: "Auto-Unpause",
      hint: "Automatically unpause the game after loading.",
      scope: "world",
      config: true,
      default: "false",
      type: Boolean
    });
    
    game.settings.register("dm_toolkit", "deleteOwnToken", {
      name: "Allow Players to Delete Own Tokens",
      hint: "This option will allow players to delete tokens they control.",
      scope: "world",
      config: true,
      default: "true",
      type: Boolean
    });
    
    // AUTO UNPAUSE
    let removePause = game.settings.get("dm_toolkit", "autoUnpause");
    if (!removePause) setTimeout(function(){ game.togglePause(); }, 500);
    
    // ENABLE PLAYERS TO DELETE OWNED TOKENS
    document.addEventListener("keyup", evt => {
      if (evt.key !== "Delete" || $(":focus").length > 0 || game.user.isGM || !game.settings.get("dm_toolkit", "deleteOwnToken")) return;
      let activeGM = game.users.find(a => a.active && a.isGM)._id || false;
      if (!activeGM) {
        ui.notifications.warn(`Could not delete any tokens because a GM is not online.`);
        return;
      }
      let layer = canvas.activeLayer;
      let ids = null;
      if ( layer.options.controllableObjects ) {
        ids = layer.controlled.reduce((ids, o) => {
          if ( o.data.locked ) return ids;
          ids.push(o.id);
          return ids;
        }, []);
      }
      if (ids.length) game.socket.emit("module.dm_toolkit", { activeGM: activeGM, ids: ids });
    });
  });
  
  // SAVES POSITION OF MINIMIZED SHEET ICONS AND RESTORES THEM
  Application.prototype.minimize = async function() {
    if ( !this.popOut || [true, null].includes(this._minimized) ) return;
    this._minimized = null;

    if (this._skycons === undefined) {
      this._skycons = {};
    }
    this._skycons.maxpos = {'x':this.position.left, 'y':this.position.top};
    if (typeof(fpin_getState) !== 'undefined') {
      const pins = game.settings.get('foundry-pin', 'pins');
      let pin = fpin_getState(this.entity, pins);
      if (pin) {
        if (pin.skycons === undefined)
          pin.skycons = {};
        pin.skycons.maxpos = {'x':this.position.left, 'y':this.position.top};
        game.settings.set('foundry-pin', 'pins', pins);
      }
    }

    // Get content
    let window = this.element,
      header = window.find('.window-header'),
      content = window.find('.window-content');

    // Remove minimum width and height styling rules
    window.css({minWidth: 100, minHeight: 30});

    // Slide-up content
    content.slideUp(100);

    // Slide up window height
    return new Promise((resolve) => {
      let target = {height: `${header[0].offsetHeight+1}px`};
      if (this._skycons.minpos !== undefined) {
        target.left = this._skycons.minpos.x;
        target.top = this._skycons.minpos.y;
        this.position.left = target.left;
        this.position.top = target.top;
      }
      window.animate(target, 100, () => {
        header.children().not(".window-title").not(".close").not(".pin").hide();
        window.animate({width: MIN_WINDOW_WIDTH}, 100, () => {
          window.addClass("minimized");
          this._minimized = true;
          resolve(true);
        });
      });
    })
  };
  
  Application.prototype.maximize = async function() {
    if ( !this.popOut || [false, null].includes(this._minimized) ) return;
    this._minimized = null;

    // Get content
    let window = this.element,
      header = window.find('.window-header'),
      content = window.find('.window-content');

    if (this._skycons === undefined) {
      this._skycons = {};
    }
    
    this._skycons.minpos = {'x':this.position.left, 'y':this.position.top};
    if (typeof(fpin_getState) !== 'undefined') {
      const pins = game.settings.get('foundry-pin', 'pins');
      let pin = fpin_getState(this.entity, pins);
      if (pin) {
        if (pin.skycons === undefined)
          pin.skycons = {};
        pin.skycons.maxpos = {'x':this.position.left, 'y':this.position.top};
        game.settings.set('foundry-pin', 'pins', pins);
      }
    }
    
    return new Promise((resolve) => {
      let target = {width: this.position.width, height: this.position.height};
      if (this._skycons.maxpos !== undefined) {
        target.left = this._skycons.maxpos.x;
        target.top = this._skycons.maxpos.y;
        this.position.left = target.left;
        this.position.top = target.top;
      }
      window.animate(target, 100, () => {
      header.children().show();
      content.slideDown(100, () => {
        window.removeClass("minimized");
        this._minimized = false;
        window.css({minWidth: '', minHeight: ''});
          this.setPosition(this.position);
          resolve(true);
        });
      });
    })
  };  
})();

/*
 FIGURE OUT HOW TO FILL TEMPLATES INSTEAD OF HIGHLIGHTING GRID SPACES
 Per Moerill: MeasuredTemplates#highlightGrid << make this do nothing
class yourMeasuredTemplate extends MeasuredTemplate {
constructor (...args) {
  super(...args);
  this._borderThickness = 0;
}
}
MeasuredTemplate = yourMeasuredTemplate;
*/