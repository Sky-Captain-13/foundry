class Expander {
	static patchFunction(func, line_number, line, new_line) {
		let funcStr = func.toString()
		let lines = funcStr.split("\n")
		if (lines[line_number].trim() == line.trim()) {
			let fixed = funcStr.replace(line, new_line)
			return Function('"use strict";return (function ' + fixed + ')')();
		}
		return func;
	}
	
	static init() {
		Sidebar.prototype.collapse = Expander.patchFunction(
			Sidebar.prototype.collapse,
			2,
			"const sidebar = this.element;",
			`
				const sidebar = this.element;;
				const chatlog = sidebar.find('.fa-comments').parent();
				chatlog.click(ev => {
					if ( this._collapsed ) {
						const sidebar = this.element;
						const tab = sidebar.find(".sidebar-tab.active");
						const icon = sidebar.find("#sidebar-tabs a.collapse i"); //console.log(icon);

						// Animate the sidebar expansion
						tab.hide();
						sidebar.animate({width: this.options.width, height: this.position.height}, 150, () => {
							sidebar.css({width: "", height: ""});
							icon.removeClass("fa-caret-left").addClass("fa-caret-right");
							tab.fadeIn(250, () => tab.css("display", ""));
							this._collapsed = false;
							sidebar.removeClass("collapsed");
							Hooks.callAll("sidebarCollapse", this, this._collapsed);
						});
					}
				});
			`
		);
	};
}

Hooks.on('init', Expander.init);