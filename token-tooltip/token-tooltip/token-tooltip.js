var tooltip = null;
Hooks.on("ready", () => {
	// Tooltip Configuration
  tooltip = $('<div class="dmtk-tooltip"></div>');

  function onMouseUpdate(event) {
    tooltip.css('left', (event.pageX + 10) + 'px');
    tooltip.css('top', (event.pageY + 10) + 'px'); 
  }

  $('body.game').append(tooltip);
  document.addEventListener('mousemove', onMouseUpdate, false);
  document.addEventListener('mouseenter', onMouseUpdate, false);
});

// Tooltip on hover
Hooks.on("hoverToken", (object, hovered) => {
	if (event.altKey) return;
	if (!object || !object.actor) return;
	
	// SETTINGS & DECLARATIONS
	let showTooltip = game.settings.get("token-tooltip", "tooltipVisibility");
	let disposition = parseInt(object.data.disposition);
	
	// PARSE TOKEN/ACTOR INFO
	let info = null;
  try {
    info = {
      ac: isNaN(parseInt(object.actor.data.data.attributes.ac.value)) ? 10 : parseInt(object.actor.data.data.attributes.ac.value),
			hp: parseInt(object.actor.data.data.attributes.hp.value),
			hpmax: parseInt(object.actor.data.data.attributes.hp.max),
			speed: object.actor.data.data.attributes.speed.value,
      passives: {
        perception: 10 + parseInt(object.actor.data.data.skills.prc.mod),
        investigation: 10 + parseInt(object.actor.data.data.skills.inv.mod)
      }
    };
  } catch (error) {
    return;
  }
	
	// DEFINE THE TEMPLATES
	let fullTemplate = $(`
		<div class="section">
			<div class="value"><i class="fas fa-shield-alt"></i>${info.ac}</div>
			<div class="value"><i class="fas fa-heart"></i>${info.hp} / ${info.hpmax}</div>
			<div class="value"><i class="far fa-eye"></i><span>${info.passives.perception}</div>
			<div class="value"><i class="fas fa-search"></i><span>${info.passives.investigation}</div>
			<div class="value"><i class="fas fa-shoe-prints"></i><span>${info.speed}</div>
		</div>
    `);
	let partialTemplate = $(`
		<div class="section">
			<div class="value"><i class="fas fa-shield-alt"></i>${info.ac}</div>
			<div class="value"><i class="fas fa-heart"></i>${info.hp} / ${info.hpmax}</div>
		</div>
    `);
	
	// DETERMINE WHICH TOOLTIP TO USE
	if (game.user.isGM) {
		template = fullTemplate;
	} else {
		if (showTooltip !== "gm") {
			if (object.actor.owner) {
				template = fullTemplate;
			} else {
				if (disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY) {
					if (showTooltip === "friendly" || showTooltip === "all") {
						template = fullTemplate;
					} else {
						hovered = false;
					}
				} else {
					if (showTooltip === "all") {
						template = partialTemplate;
					} else {
						hovered = false;
					}
				}
			}
		} else {
			hovered = false;
		}
	}
	
  // ADD OR REMOVE THE TOOLTIP
  if (hovered) {
    tooltip.html(template);
    tooltip.addClass('visible');
  } else {
		tooltip.html("<div></div>");
    tooltip.removeClass('visible');
  }
});
