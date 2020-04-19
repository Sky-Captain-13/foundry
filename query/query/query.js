const Query = (() => {
	// VERSION INFORMATION
	const Query_Author = "Sky#9453";
	const Query_Version = "0.0.3";
	const Query_LastUpdated = 1587317690;
	
	const handleQuery = async function(msg, chatData) {
		let content = chatData;
		if (content.includes("?{")) {
			while (content.includes("?{")) {
				let query = content.match(/\?{([^}]+)}/)[0];
				let title = query.split("|")[0].replace("?{", "");
				let options = query.replace("?{" + title + "|", "").replace("}", "").split("|");
				let selectOptions = "";
				let option = "";
				let value = "";
				let html = "";
				if (options.length > 1) {
					for (a = 0; a < options.length; a++) {
						option = (options[a].includes(",")) ? options[a].split(",")[0].trim() : options[a];
						value = (options[a].includes(",")) ? options[a].split(",")[1].trim() : options[a];
						selectOptions += `<option value="${value}">${option}</option>`;
					}
					html = `
						<div class="form-group">
							<label style='font-weight: bold;'>
								${title}
							</label>
							<select id="rollQuery" name="rollQuery" style="margin-bottom: 5px;">
								${selectOptions}
							</select>
						</div>`;
				} else {
					html = `
						<div class="form-group">
							<label style='font-weight: bold;'>
								${title}
							</label>
							<input id='rollQuery' name='rollQuery' type='text' value='${options[0]}' onfocus='this.select()' style='width: unset; margin-bottom: 5px;'>
						</div>`;
				}
				const selected = await new Promise((resolve, reject) => {
					setTimeout(function () {
						new Dialog({
							title: "Query",
							content: html,
							buttons: {
								yes: {
									icon: '<i class="fas fa-check"></i>',
									label: 'Select',
									callback: html => resolve(html.find('[name="rollQuery"]')[0].value)
								},
								no: {
									icon: '<i class="fas fa-times"></i>',
									label: 'Cancel',
									callback: reject
									}
								},
								default: "yes",
								close: reject
						}, options).render(true);
						setTimeout(function() { document.getElementById("rollQuery").focus(); }, 250);
					}, 100);
				});
				content = content.replace(/\?{([^}]+)}/, selected);
			}
			ChatMessage.create({
				user: game.user._id,
				content: content,
				speaker: { alias: game.user.charname || game.user.name},
				type: CONST.CHAT_MESSAGE_TYPES.OTHER
			});
		}
	};
	
	const handleInput = function(msg, chatData) {
		if (chatData.includes("?{")) {
			handleQuery(msg, chatData);
			return false;
		}
	};
	
	// HOOKS
	Hooks.on("ready", function() {
		Hooks.on("chatMessage", handleInput);
		console.log("-=> Query by Sky#9453 v" + Query_Version + " <=- [" + (new Date(Query_LastUpdated * 1000)) + "]");   
		//console.log(Date.now().toString().substr(0, 10));
	});
})();