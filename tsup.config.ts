import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm", "iife"], // Added 'iife' for plain <script> tags
	globalName: "DragDrop", // Exposes window.DragDrop for script tags
	splitting: false,
	sourcemap: true,
	dts: true,
	clean: true,
	injectStyle: true,
	minify: true, // Minifies output for faster CDN/script tag loading
	outExtension({ format }) {
		return {
			js: format === "esm" ? ".mjs" : format === "cjs" ? ".cjs" : ".global.js", // IIFE bundle for <script>
		};
	},
});
