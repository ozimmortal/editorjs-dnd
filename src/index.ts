import "./index.css";
import type { API, EditorConfig } from "@editorjs/editorjs";

type BorderStyle =
	| "none"
	| "hidden"
	| "solid"
	| "dashed"
	| "dotted"
	| "double"
	| "groove"
	| "ridge"
	| "inset"
	| "outset";

export interface DragDropOptions {
	dropLineColor?: string;
	dropLineStyle?: BorderStyle;
	dropLineSize?: number;
}

export interface DragDropEditor {
	configuration: EditorConfig;
	blocks: API["blocks"];
	toolbar: API["toolbar"];
}

export default class DragDrop {
	private holder: HTMLElement;
	private blocks: API["blocks"];
	private toolbar: API["toolbar"];
	private dropLineColor: string;
	private dropLineStyle: BorderStyle;
	private dropLineSize: number;
	private readOnly: boolean;
	private startBlockIndex: number | null;
	private endBlockIndex: number | null;
	private ghostElement: HTMLElement | null;

	constructor(editor: DragDropEditor, options: DragDropOptions = {}) {
		const {
			dropLineColor = "#7c00f0",
			dropLineStyle = "solid",
			dropLineSize = 2,
		} = options;

		const holder = editor.configuration.holder;

		const element =
			typeof holder === "string" ? document.getElementById(holder) : holder;

		if (!(element instanceof HTMLElement)) {
			throw new Error("Editor holder element not found");
		}

		this.holder = element;
		this.blocks = editor.blocks;
		this.toolbar = editor.toolbar;

		this.dropLineColor = dropLineColor;
		this.dropLineStyle = dropLineStyle;
		this.dropLineSize = dropLineSize;

		this.readOnly = editor.configuration.readOnly ?? false;
		this.startBlockIndex = null;
		this.endBlockIndex = null;
		this.ghostElement = null;

		this.init();
	}

	private init(): void {
		if (this.readOnly) {
			return;
		}

		this.attachDragListener();
		this.attachDropListener();
	}

	private attachDragListener(): void {
		const settingsButtons = this.holder.querySelector(
			".ce-toolbar__settings-btn",
		);
		if (settingsButtons) {
			this.initalizeDragListener(settingsButtons as HTMLElement);
		} else {
			const observer = new MutationObserver(() => {
				const settingsButtons = this.holder.querySelector(
					".ce-toolbar__settings-btn",
				);
				if (settingsButtons) {
					this.initalizeDragListener(settingsButtons as HTMLElement);
					observer.disconnect();
				}
			});
			observer.observe(this.holder, { childList: true, subtree: true });
		}
	}

	private attachDropListener(): void {
		this.holder.addEventListener("drop", (event) => {
			event.preventDefault();
			if (!(event.target instanceof Element)) {
				return;
			}

			const target = this.getDropTarget(event.target);
			if (!target) {
				return;
			}
			this.endBlockIndex = this.getTargetPosition(target);
			if (this.startBlockIndex !== null && this.endBlockIndex !== null) {
				this.moveBlock(this.startBlockIndex, this.endBlockIndex);
			}
		});

		this.holder.addEventListener("dragend", () => {
			// remove the ghost element if it exists
			if (this.ghostElement) {
				this.ghostElement.remove();
				this.ghostElement = null;
			}

			// clean up borders
			const allBlocks = this.holder.querySelectorAll(".ce-block");
			for (const block of allBlocks) {
				const blockContent = block.querySelector(
					".ce-block__content",
				) as HTMLElement;
				blockContent.style.borderTop = "";
				blockContent.style.borderBottom = "";
			}
		});
	}

	private initalizeDragListener(settingsButtons: HTMLElement): void {
		settingsButtons.setAttribute("draggable", "true");
		settingsButtons.addEventListener("dragstart", () => {
			this.startBlockIndex = this.blocks.getCurrentBlockIndex();

			const currentBlockContent = this.getCurrentBlockContent();
			if (currentBlockContent) {
				this.ghostElement = this.createGhostElement(currentBlockContent);
			}
		});

		this.holder.addEventListener("dragover", (event) => {
			event.preventDefault();
			this.toolbar.close();

			const { clientX, clientY } = event;
			this.updateGhostElementPosition(clientX, clientY);

			// logit to draw out the drop line
			const allBlocks = this.holder.querySelectorAll(".ce-block");
			const targetElement =
				event.target instanceof Element ? event.target : null;
			const focusedBlock = targetElement
				? this.getDropTarget(targetElement)
				: null;
			this.handleDropLine(allBlocks, focusedBlock);
		});
	}

	private handleDropLine(
		allBlocks: NodeListOf<Element>,
		focusedBlock: Element | null,
	): void {
		if (this.startBlockIndex === null) return;

		const borderString = `${this.dropLineSize}px ${this.dropLineStyle} ${this.dropLineColor}`;

		for (const [idx, block] of allBlocks.entries()) {
			const blockContent = block.querySelector(
				".ce-block__content",
			) as HTMLElement;

			blockContent.style.borderTop = "";
			blockContent.style.borderBottom = "";

			if (block === focusedBlock) {
				if (idx > this.startBlockIndex) {
					blockContent.style.borderBottom = borderString;
				} else {
					blockContent.style.borderTop = borderString;
				}
			}
		}
	}

	private createGhostElement(content: HTMLElement): HTMLElement {
		const ghost = content.cloneNode(true) as HTMLElement;

		ghost.style.position = "fixed";
		ghost.style.top = "0";
		ghost.style.left = "0";
		ghost.style.opacity = "0.6";
		ghost.style.pointerEvents = "none";
		ghost.style.zIndex = "9999";
		ghost.style.width = `${content.offsetWidth}px`;
		ghost.style.willChange = "transform";
		ghost.removeAttribute("id");
		document.body.appendChild(ghost);

		return ghost;
	}

	updateGhostElementPosition(x: number, y: number): void {
		if (this.ghostElement) {
			const gap = 20; // Adjust the gap as needed
			this.ghostElement.style.transform = `translate(${x + gap}px, ${y - gap}px)`;
		}
	}

	getCurrentBlockContent(): HTMLElement | null {
		if (this.startBlockIndex === null || this.isTheOnlyBlock()) {
			return null;
		}
		const currentBlock = this.blocks.getBlockByIndex(this.startBlockIndex);
		if (!currentBlock) {
			return null;
		}
		return currentBlock.holder.querySelector(".ce-block__content");
	}

	isTheOnlyBlock(): boolean {
		return this.blocks.getBlocksCount() === 1;
	}

	getDropTarget(target: Element): Element | null {
		return target.classList.contains("ce-block")
			? target
			: target.closest(".ce-block");
	}

	getTargetPosition(target: Element): number | null {
		if (!target.parentNode) {
			return null;
		}
		return Array.from(target.parentNode.children).indexOf(target);
	}

	moveBlock(fromIndex: number, toIndex: number): void {
		this.blocks.move(toIndex, fromIndex);
	}
}
