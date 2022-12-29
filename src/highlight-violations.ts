import { MatchDecorator, ViewPlugin, Decoration } from "@codemirror/view";

const decoration = Decoration.mark({
	attributes: {
		class: "constraint-violation",
	},
});

const decorator = new MatchDecorator({
	regexp: /\w*[eEÈ-ËĒ-ěè-ë]\w*/g,
	decoration,
	boundary: /\s/,
});

export const highlightViolations = ViewPlugin.define(
	(view) => ({
		decorations: decorator.createDeco(view),
		update(u): void {
			this.decorations = decorator.updateDeco(u, this.decorations);
		},
	}),
	{
		decorations: (v) => v.decorations,
	}
);
