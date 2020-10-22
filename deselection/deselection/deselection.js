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
			14,
			"if ( isSelect && !release ) return;",
			`
			if ( isSelect && tool === "target" && !release ) {
				canvas.activeLayer.targetObjects({}, {releaseOthers: true});
				return;
			};
			`
		);
	}
}

Hooks.on('init', Deselection.init);