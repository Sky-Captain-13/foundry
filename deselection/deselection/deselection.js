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
		Canvas.prototype._onMouseDown = Deselection.patchFunction(
			Canvas.prototype._onMouseDown,
			22,
			"event.data._selectState = 1;",
			`if (canvas.ready && game.user.isGM && Object.keys(canvas.activeLayer._controlled).length) canvas.activeLayer.releaseAll();
			event.data._selectState = 1;`
		);
	}
}

Hooks.on('init', Deselection.init);