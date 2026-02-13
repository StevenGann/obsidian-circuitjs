import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	...tseslint.configs.recommended,
	{
		ignores: [
			"node_modules/**",
			"main.js",
			"*.mjs",
			"*.mts",
			"vendor/**",
			"scripts/**",
			"dist/**",
			"circuitjs/**",
		],
	}
);
