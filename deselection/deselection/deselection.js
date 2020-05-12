class Deselection {
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
		Canvas.prototype._onClickLeft = Deselection.patchFunction(
			Canvas.prototype._onClickLeft,
			13,
			"if ( isSelect ) return;",
			`
			if ( isSelect && canvas.controls.select.active ) {
					canvas.controls.select.clear();
					canvas.controls.select.active = false;
					if ( tool === "select" ) return layer.selectObjects(coords);
					if ( tool === "target" ) return layer.targetObjects(coords, {releaseOthers: !originalEvent.shiftKey});
				}
			`
		);
	}
}

Hooks.on('init', Deselection.init);