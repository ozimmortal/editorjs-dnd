# Drag/Drop Plugin for Editor.js

<img width="924" height="340" alt="Recording 2026-09-06 131813" src="https://github.com/user-attachments/assets/ffc9fb23-b62b-44cf-868b-8a549807dc2c" />


A lightweight drag-and-drop plugin for [Editor.js](https://editorjs.io/) that lets you reorder blocks by dragging them directly from the block settings button.

## ✨ Features

* 🖱️ Drag and drop Editor.js blocks
* 👻 Visual ghost preview while dragging
* 📍 Drop position indicator
* 🎨 Customizable drop-line color, style, and size
* 🔒 Automatically disabled when Editor.js is in read-only mode
* 📦 Lightweight and easy to integrate
* 🔷 Full TypeScript support

## Installation

```bash
npm install editorjs-dnd
```

or:

```bash
pnpm add editorjs-dnd
```

or:

```bash
yarn add editorjs-dnd
```

## Usage

Initialize Editor.js normally, then create the drag-and-drop plugin when the editor is ready:

```ts
import EditorJS from "@editorjs/editorjs";
import DragDrop from "editorjs-dnd";

const editor = new EditorJS({
  holder: "editor",
  tools: {
    // Your Editor.js tools
  },

  onReady: () => {
    new DragDrop(editor);
  },
});
```

That's it. You can now drag blocks using the block settings button.

## React

The plugin can be used with Editor.js in React applications as well:

```tsx
import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import DragDrop from "editorjs-dnd";

function Editor() {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      return;
    }

    const editor = new EditorJS({
      holder: "editor",

      onReady: () => {
        new DragDrop(editor);
      },
    });

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  return <div id="editor" />;
}

export default Editor;
```

## Configuration

You can customize the appearance of the drop indicator:

```ts
new DragDrop(editor, {
  dropLineColor: "#7c00f0",
  dropLineStyle: "solid",
  dropLineSize: 2,
});
```

### Options

| Option          | Type          | Default   | Description                 |
| --------------- | ------------- | --------- | --------------------------- |
| `dropLineColor` | `string`      | `#7c00f0` | Color of the drop indicator |
| `dropLineStyle` | `BorderStyle` | `solid`   | CSS border style            |
| `dropLineSize`  | `number`      | `2`       | Width of the drop indicator |

### Border styles

`dropLineStyle` supports the following CSS border styles:

```text
none
hidden
solid
dashed
dotted
double
groove
ridge
inset
outset
```

Example:

```ts
new DragDrop(editor, {
  dropLineColor: "#ff0000",
  dropLineStyle: "dashed",
  dropLineSize: 3,
});
```

## How it works

The plugin uses the Editor.js block settings button as the drag handle.

When a block is dragged:

1. The current block is detected.
2. A visual copy of the block follows the cursor.
3. The plugin detects the block underneath the cursor.
4. A drop indicator shows where the block will be placed.
5. When the block is released, Editor.js moves the block to the new position.

## Read-only mode

Drag and drop is automatically disabled when Editor.js is initialized in read-only mode:

```ts
const editor = new EditorJS({
  holder: "editor",
  readOnly: true,
});
```

No additional configuration is required.

## Requirements

* Editor.js
* A modern browser with HTML5 drag-and-drop support

## TypeScript

The package includes TypeScript declarations out of the box, so no additional `@types` package is required.

```ts
import DragDrop, { DragDropOptions } from "editorjs-dnd";
```

## Development

Clone the repository:

```bash
git clone https://github.com/ozimmortal/editorjs-dnd.git
cd editorjs-dnd
```

Install dependencies:

```bash
pnpm install
```

Run tests:

```bash
pnpm test
```

Build the package:

```bash
pnpm build
```

## Contributing

Contributions, bug reports, and feature requests are welcome.

If you find a bug or have an idea for improving the plugin, please open an issue or submit a pull request.

## License

MIT © Oliyad Zelalem
