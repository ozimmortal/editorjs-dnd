// @vitest-environment jsdom
import type EditorJS from "@editorjs/editorjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DragDrop from "../src/index";

type TestEditorJS = EditorJS & {
	configuration: {
		holder: HTMLElement | string;
		readOnly?: boolean;
	};
};

describe("DragDrop", () => {
	let editor: TestEditorJS;
	let dragDropInstance: DragDrop;
	let button: HTMLElement;

	beforeEach(() => {
		document.body.innerHTML = `
			<div id="editorjs">
				<div id="first" class="ce-block">
					<div class="ce-block__content">First</div>
				</div>

				<div id="second" class="ce-block">
					<div class="ce-block__content">Second</div>
				</div>

				<div class="ce-toolbar__settings-btn">
					Drag
				</div>
			</div>
		`;

		const holder = document.getElementById("editorjs");
		editor = {
			configuration: {
				holder,
				readOnly: false,
			},
			blocks: {
				getCurrentBlockIndex: vi.fn().mockReturnValue(0),
				getBlockByIndex: vi.fn(),
				getBlocksCount: vi.fn().mockReturnValue(2),
				move: vi.fn(),
			},
			toolbar: {
				close: vi.fn(),
			},
		} as unknown as TestEditorJS;

		dragDropInstance = new DragDrop(editor as unknown as EditorJS);
		button = dragDropInstance.holder.querySelector(
			".ce-toolbar__settings-btn",
		) as HTMLElement;

		button.dispatchEvent(new Event("dragstart", { bubbles: true }));
	});

	it("throws when editor holder does not exist", () => {
		const invalidEditor = {
			...editor,
			configuration: {
				holder: "does-not-exist",
				readOnly: false,
			},
		} as unknown as EditorJS;

		expect(() => new DragDrop(invalidEditor)).toThrow(
			"Editor holder element not found",
		);
	});

	it("should initialize with correct properties", () => {
		expect(dragDropInstance.holder).toBe(editor.configuration.holder);
		expect(dragDropInstance.blocks).toBe(editor.blocks);
		expect(dragDropInstance.toolbar).toBe(editor.toolbar);
		expect(dragDropInstance.dropLineColor).toBe("#7c00f0");
		expect(dragDropInstance.dropLineStyle).toBe("solid");
		expect(dragDropInstance.dropLineSize).toBe(2);
		expect(dragDropInstance.readOnly).toBe(false);
		expect(dragDropInstance.startBlockIndex).toBe(0);
		expect(dragDropInstance.endBlockIndex).toBeNull();
		expect(dragDropInstance.ghostElement).toBeNull();
	});

	it("should move the block when dropped on a valid target", () => {
		const targetElement = document.getElementById("second") as HTMLElement;
		targetElement.dispatchEvent(new Event("drop", { bubbles: true }));
		expect(editor.blocks.move).toHaveBeenCalledWith(1, 0);
	});

	it("should return the drop target when a valid target is provided", () => {
		const targetElement = document.getElementById("second") as HTMLElement;
		const dropTarget = dragDropInstance.getDropTarget(targetElement);
		expect(dropTarget).toBe(targetElement);
	});

	it("should return null when an invalid target is provided", () => {
		const invalidElement = document.createElement("div");
		const dropTarget = dragDropInstance.getDropTarget(invalidElement);
		expect(dropTarget).toBeNull();
	});

	it("should return the correct target position for a valid target", () => {
		const targetElement = document.getElementById("second") as HTMLElement;
		const position = dragDropInstance.getTargetPosition(targetElement);
		expect(position).toBe(1);
	});

	it("should return null for an invalid target position", () => {
		const invalidElement = document.createElement("div");
		const position = dragDropInstance.getTargetPosition(invalidElement);
		expect(position).toBeNull();
	});

	it("should test if it is the only block", () => {
		expect(dragDropInstance.isTheOnlyBlock()).toBe(false);
	});
});
