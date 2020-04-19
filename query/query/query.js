const Query = (() => {
	// VERSION INFORMATION
	const Query_Author = "Sky#9453";
	const Query_Version = "0.0.1";
	const Query_LastUpdated = 1587256223;
	
	const handleInput = function(msg) {
		let content = msg.content;
		if (content.includes("?{")) {
			while (content.includes("?{")) {
				let query = content.match(/\?{([^}]+)}/)[0];
				let title = query.split("|")[0].replace("?{", "");
				let options = query.replace("?{" + title + "|", "").replace("}", "").split("|");
				let selectOptions = "";
				let applySelection = false;
				let option = "";
				let value = "";
				let selected = "";
				for (a = 0; a < options.length; a++) {
					option = (options[a].includes(",")) ? options[a].split(",")[0] : options[a];
					value = (options[a].includes(",")) ? options[a].split(",")[1] : options[a];
					selectOptions += `<option value="${value}">${option}</option>`;
				}
				
				new Dialog({
					title: `${title}`,
					content: `
						<div class="form-group">
							<label></label>
							<select id="" name="rollQuery" style="margin-bottom: 5px; width: 100%;">
								${selectOptions}
							</select>
						`,
					buttons: {
						yes: {
							icon: "<i class='fas fa-check'></i>",
							label: `Select`,
							callback: () => applySelection = true
						},
						no: {
							icon: "<i class='fas fa-times'></i>",
							label: `Cancel`
						},
					},
					default: "yes",
					close: html => {
						if (applySelection) selected = html.find('[name="rollQuery"]')[0].value;
					}
				}).render(true);
				
				// Replace content and move on...
				queryDialog().then(content = content.replace(/\?{([^}]+)}/, selected));
			}
			msg.content = content;
		}
	};
	
	// HOOKS
	Hooks.on("ready", function() {
		Hooks.on("preCreateChatMessage", handleInput);
		console.log("-=> Query by Sky#9453 v" + Query_Version + " <=- [" + (new Date(Query_LastUpdated * 1000)) + "]");   
		//console.log(Date.now().toString().substr(0, 10));
	});
})();