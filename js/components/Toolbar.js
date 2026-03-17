import { html } from '../lib/ui.js';

function icon(paths, options = {}) {
    const { viewBox = '0 0 24 24', strokeWidth = 1.8 } = options;
    return html`
        <svg class="toolbar-icon" viewBox=${viewBox} fill="none" stroke="currentColor" stroke-width=${strokeWidth} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            ${paths}
        </svg>
    `;
}

function getCurrentBlockAttr(editor, key) {
    const types = ['paragraph', 'heading', 'blockquote', 'bulletList', 'orderedList', 'listItem'];
    for (const type of types) {
        const value = editor.getAttributes(type)?.[key];
        if (value) return value;
    }
    return null;
}

const buttons = [
    {
        id: 'paragraphBtn',
        title: 'Paragraph',
        label: html`<span class="toolbar-text-label">P</span>`,
        execute: (editor) => editor.chain().focus().setParagraph().run(),
        active: (editor) => editor.isActive('paragraph'),
    },
    {
        id: 'boldBtn',
        title: 'Bold',
        label: html`<span class="toolbar-text-label toolbar-text-label--bold">B</span>`,
        execute: (editor) => editor.chain().focus().toggleBold().run(),
        active: (editor) => editor.isActive('bold'),
    },
    {
        id: 'italicBtn',
        title: 'Italic',
        label: html`<span class="toolbar-text-label toolbar-text-label--italic">I</span>`,
        execute: (editor) => editor.chain().focus().toggleItalic().run(),
        active: (editor) => editor.isActive('italic'),
    },
    {
        id: 'underlineBtn',
        title: 'Underline',
        label: icon(html`<path d="M6 4v7a6 6 0 0 0 12 0V4"></path><path d="M5 20h14"></path>`),
        execute: (editor) => editor.chain().focus().toggleUnderline().run(),
        active: (editor) => editor.isActive('underline'),
    },
    {
        id: 'strikeBtn',
        title: 'Strikethrough',
        label: html`<span class="toolbar-text-label toolbar-text-label--strike">S</span>`,
        execute: (editor) => editor.chain().focus().toggleStrike().run(),
        active: (editor) => editor.isActive('strike'),
    },
    { separator: true },
    {
        id: 'h1Btn',
        title: 'Heading 1',
        label: 'H1',
        execute: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: (editor) => editor.isActive('heading', { level: 1 }),
    },
    {
        id: 'h2Btn',
        title: 'Heading 2',
        label: 'H2',
        execute: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: (editor) => editor.isActive('heading', { level: 2 }),
    },
    {
        id: 'h3Btn',
        title: 'Heading 3',
        label: 'H3',
        execute: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: (editor) => editor.isActive('heading', { level: 3 }),
    },
    { separator: true },
    {
        id: 'bulletBtn',
        title: 'Bullet List',
        label: icon(html`
            <path d="M10 6h10"></path>
            <path d="M10 12h10"></path>
            <path d="M10 18h10"></path>
            <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none"></circle>
            <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
            <circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none"></circle>
        `),
        execute: (editor) => editor.chain().focus().toggleBulletList().run(),
        active: (editor) => editor.isActive('bulletList'),
    },
    {
        id: 'orderedBtn',
        title: 'Numbered List',
        label: icon(html`
            <path d="M10 6h10"></path>
            <path d="M10 12h10"></path>
            <path d="M10 18h10"></path>
            <path d="M4 5h2v4"></path>
            <path d="M3.5 12h3"></path>
            <path d="M4 16.5c0-1 2-1 2-2.5 0-.8-.6-1.5-1.5-1.5-.7 0-1.2.3-1.7.8"></path>
            <path d="M3.5 19.5h3"></path>
        `),
        execute: (editor) => editor.chain().focus().toggleOrderedList().run(),
        active: (editor) => editor.isActive('orderedList'),
    },
    {
        id: 'blockquoteBtn',
        title: 'Blockquote',
        label: icon(html`
            <path d="M9 8H6a2 2 0 0 0-2 2v3h4v5"></path>
            <path d="M20 8h-3a2 2 0 0 0-2 2v3h4v5"></path>
        `),
        execute: (editor) => editor.chain().focus().toggleBlockquote().run(),
        active: (editor) => editor.isActive('blockquote'),
    },
    {
        id: 'codeBlockBtn',
        title: 'Code Block',
        label: icon(html`
            <path d="M9 18 3 12l6-6"></path>
            <path d="m15 6 6 6-6 6"></path>
        `),
        execute: (editor) => editor.chain().focus().toggleCodeBlock().run(),
        active: (editor) => editor.isActive('codeBlock'),
    },
    {
        id: 'ruleBtn',
        title: 'Horizontal Rule',
        label: icon(html`<path d="M4 12h16"></path><path d="M8 8h8"></path><path d="M8 16h8"></path>`),
        execute: (editor) => editor.chain().focus().setHorizontalRule().run(),
        active: () => false,
    },
    { separator: true },
    {
        id: 'alignLeftBtn',
        title: 'Align Left',
        label: icon(html`
            <path d="M4 6h14"></path>
            <path d="M4 10h10"></path>
            <path d="M4 14h14"></path>
            <path d="M4 18h10"></path>
        `),
        execute: (editor) => editor.chain().focus().setTextAlign('left').run(),
        active: (editor) => (getCurrentBlockAttr(editor, 'textAlign') || 'left') === 'left',
    },
    {
        id: 'alignCenterBtn',
        title: 'Align Center',
        label: icon(html`
            <path d="M5 6h14"></path>
            <path d="M7 10h10"></path>
            <path d="M5 14h14"></path>
            <path d="M7 18h10"></path>
        `),
        execute: (editor) => editor.chain().focus().setTextAlign('center').run(),
        active: (editor) => getCurrentBlockAttr(editor, 'textAlign') === 'center',
    },
    {
        id: 'alignRightBtn',
        title: 'Align Right',
        label: icon(html`
            <path d="M6 6h14"></path>
            <path d="M10 10h10"></path>
            <path d="M6 14h14"></path>
            <path d="M10 18h10"></path>
        `),
        execute: (editor) => editor.chain().focus().setTextAlign('right').run(),
        active: (editor) => getCurrentBlockAttr(editor, 'textAlign') === 'right',
    },
    {
        id: 'alignJustifyBtn',
        title: 'Justify',
        label: icon(html`
            <path d="M4 6h16"></path>
            <path d="M4 10h16"></path>
            <path d="M4 14h16"></path>
            <path d="M4 18h16"></path>
        `),
        execute: (editor) => editor.chain().focus().setTextAlign('justify').run(),
        active: (editor) => getCurrentBlockAttr(editor, 'textAlign') === 'justify',
    },
    { separator: true },
    {
        id: 'ltrBtn',
        title: 'Left-to-Right Direction',
        label: icon(html`
            <path d="M4 6h10"></path>
            <path d="M4 10h14"></path>
            <path d="M4 14h10"></path>
            <path d="M4 18h14"></path>
            <path d="m16 8 4 4-4 4"></path>
        `),
        execute: (editor) => editor.chain().focus().setTextDirection('ltr').run(),
        active: (editor) => (getCurrentBlockAttr(editor, 'dir') || 'ltr') === 'ltr',
    },
    {
        id: 'rtlBtn',
        title: 'Right-to-Left Direction',
        label: icon(html`
            <path d="M10 6h10"></path>
            <path d="M6 10h14"></path>
            <path d="M10 14h10"></path>
            <path d="M6 18h14"></path>
            <path d="m8 8-4 4 4 4"></path>
        `),
        execute: (editor) => editor.chain().focus().setTextDirection('rtl').run(),
        active: (editor) => getCurrentBlockAttr(editor, 'dir') === 'rtl',
    },
    { separator: true },
    {
        id: 'undoBtn',
        title: 'Undo',
        label: icon(html`<path d="M9 14 4 9l5-5"></path><path d="M20 20a8 8 0 0 0-8-8H4"></path>`),
        execute: (editor) => editor.chain().focus().undo().run(),
        active: () => false,
        disabled: (editor) => !editor.can().chain().focus().undo().run(),
    },
    {
        id: 'redoBtn',
        title: 'Redo',
        label: icon(html`<path d="m15 14 5-5-5-5"></path><path d="M4 20a8 8 0 0 1 8-8h8"></path>`),
        execute: (editor) => editor.chain().focus().redo().run(),
        active: () => false,
        disabled: (editor) => !editor.can().chain().focus().redo().run(),
    },
];

export function Toolbar({ editor, editorVersion }) {
    editorVersion;

    return html`
        <div class="editor-format-actions">
            ${buttons.map((button) => {
                if (button.separator) {
                    return html`<span class="toolbar-sep"></span>`;
                }

                const isActive = editor ? button.active(editor) : false;
                const isDisabled = !editor || button.disabled?.(editor);
                return html`
                    <button
                        id=${button.id}
                        type="button"
                        title=${button.title}
                        aria-label=${button.title}
                        class=${isActive ? 'is-active' : ''}
                        disabled=${isDisabled}
                        onClick=${() => {
                            if (!editor) return;
                            button.execute(editor);
                        }}
                    >
                        ${button.label}
                    </button>
                `;
            })}
        </div>
    `;
}
