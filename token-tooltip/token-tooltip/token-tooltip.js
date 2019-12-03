var tooltip = null;
Hooks.on("ready", () => {
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
  if (!game.user.isGM  || event.altKey) return;
  if (object === null || !object.actor) return;
  if (!game.user.isGM && !object.actor.owner) return;

  // parse info
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

  // display the tooptip
  if (hovered) {
    let template = null;
		template = $(`
		<div class="section">
			<div class="value"><i class="fas fa-shield-alt"></i> ${info.ac}</div>
			<div class="value"><i class="fas fa-heart"></i> ${info.hp} / ${info.hpmax}</div>
			<div class="value"><i class="far fa-eye"></i><span>${info.passives.perception}</div>
			<div class="value"><i class="fas fa-search"></i><span>${info.passives.investigation}</div>
			<div class="value"><i class="fas fa-shoe-prints"></i><span>${info.speed}</div>
		</div>
    `);
    tooltip.html(template);
    tooltip.addClass('visible');
  } else {
		tooltip.html("<div></div>");
    tooltip.removeClass('visible');
  }
});
