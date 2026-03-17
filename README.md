# browser-voice-scribe

> Fully in-browser, zero-backend voice dictation powered by Whisper + WebLLM.

No server. No API keys. No build step. All AI inference runs locally in your browser via WebAssembly and WebGPU.

## What it does

Hold a button, speak, release — your speech is transcribed by a local Whisper model and optionally polished by a small quantized LLM running on-device. The result appears in a rich text editor you can copy, format, or have read aloud.

## How it works

1. **Speech recognition** — Whisper (tiny / base / small) runs in the browser via ONNX + WebAssembly, powered by `@xenova/transformers`.
2. **Text formatting** — A small quantized LLM (SmolLM2, Qwen2.5, Qwen3, TinyLlama) runs on WebGPU via `@mlc-ai/web-llm` to fix punctuation and capitalisation. Automatically falls back to a built-in rule-based formatter when WebGPU is unavailable.
3. **Rich text editing** — Tiptap provides the editable transcript area with a full formatting toolbar (bold, italic, headings, lists, alignment, RTL/LTR direction, undo/redo).
4. **Reactive UI** — Built with Preact + htm and `@preact/signals`. No build tooling required — all dependencies are loaded directly from CDN as native ES modules.

---

## Dependencies (all loaded from CDN — no install needed)

The project has **no package.json and no build step**. Every dependency is imported directly in the browser as an ES module from a pinned CDN URL.

### UI framework

| Package | Version | CDN URL |
|---|---|---|
| `preact` | `10` | `https://esm.sh/preact@10` |
| `preact/hooks` | `10` | `https://esm.sh/preact@10/hooks` |
| `htm` | `3.1.1` | `https://esm.sh/htm@3.1.1` |
| `@preact/signals` | `2` | `https://esm.sh/@preact/signals@2` |

### Rich text editor (Tiptap)

| Package | Version | CDN URL |
|---|---|---|
| `@tiptap/core` | `2.11.5` | `https://esm.sh/@tiptap/core@2.11.5` |
| `@tiptap/starter-kit` | `2.11.5` | `https://esm.sh/@tiptap/starter-kit@2.11.5` |
| `@tiptap/extension-placeholder` | `2.11.5` | `https://esm.sh/@tiptap/extension-placeholder@2.11.5` |
| `@tiptap/extension-text-align` | `2.11.5` | `https://esm.sh/@tiptap/extension-text-align@2.11.5` |
| `@tiptap/extension-underline` | `2.11.5` | `https://esm.sh/@tiptap/extension-underline@2.11.5` |

### Speech recognition (Whisper via ONNX/WASM)

| Package | Version | CDN URL |
|---|---|---|
| `@xenova/transformers` | `2.17.2` | `https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2` |

### On-device LLM (WebGPU)

| Package | Version | CDN URLs (tried in order) |
|---|---|---|
| `@mlc-ai/web-llm` | `0.2.79` | `https://esm.run/@mlc-ai/web-llm@0.2.79` → `https://esm.sh/@mlc-ai/web-llm@0.2.79?target=es2022` |

> WebLLM has two CDN fallback candidates. If `esm.run` fails, `esm.sh` is tried automatically.

---

## Models

### Whisper (speech recognition)

| Model | Params | Notes |
|---|---|---|
| `Xenova/whisper-tiny.en` | ~39M | Fastest, recommended for mobile / low-end |
| `Xenova/whisper-base.en` | ~74M | Balanced (default) |
| `Xenova/whisper-small.en` | ~244M | Higher accuracy |

### LLM formatter (optional, WebGPU)

| Model ID | Notes |
|---|---|
| `SmolLM2-360M-Instruct-q4f32_1-MLC` | Very light, broad GPU compatibility |
| `SmolLM2-360M-Instruct-q4f16_1-MLC` | Lighter VRAM, requires `shader-f16` |
| `Qwen2.5-0.5B-Instruct-q4f32_1-MLC` | Balanced lightweight (default) |
| `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` | Faster, requires `shader-f16` |
| `Qwen3-0.6B-q4f32_1-MLC` | Newer small model |
| `Qwen3-0.6B-q4f16_1-MLC` | Faster, requires `shader-f16` |
| `TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC` | Stronger quality, heavier |
| `TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC` | Stronger + faster, requires `shader-f16` |
| `Qwen2.5-1.5B-Instruct-q4f32_1-MLC` | Best quality among light set |
| `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | Best quality + faster, requires `shader-f16` |

`q4f16` variants are faster but require `shader-f16` WebGPU feature support (most discrete GPUs; not always available on integrated graphics).

---

## Usage

No build step needed. Just serve the files with any static file server:

```bash
# Python
python3 -m http.server 8080

# Node / npx
npx serve .
```

Then open `http://localhost:8080` in a modern browser. Chrome or Edge are recommended for WebGPU support.

1. Select your preferred Whisper model, formatter mode, and LLM.
2. Click **Load Models** — first load downloads model weights (~150 MB+ depending on model), subsequent loads use the browser cache.
3. Hold the **Hold to Speak** button, speak, then release.
4. Your transcript appears in the editor. Edit, format, copy, or click **Speak** to have the browser read it aloud via the Web Speech API.

---

## Browser requirements

| API | Purpose | Required |
|---|---|---|
| `MediaRecorder` | Audio capture | Yes |
| `getUserMedia` | Microphone access | Yes |
| `AudioContext` | Audio decoding | Yes |
| WebGPU | On-device LLM formatting | No (falls back to rule-based) |

> **Privacy note:** All processing happens locally in your browser. No audio, text, or data is sent to any server.

---

## Project structure

```
├── index.html
├── styles.css
└── js/
    ├── app.js                  # Entry point
    ├── audio.js                # Audio decoding & device profiling
    ├── formatter.js            # Rule-based + LLM text formatting
    ├── state.js                # Preact signals global state
    ├── storage.js              # localStorage helpers
    ├── lib/
    │   └── ui.js               # Re-exports Preact + htm from CDN
    ├── components/
    │   ├── App.js              # Root component
    │   ├── Controls.js         # Record / Load / Speak buttons
    │   ├── EditorMeta.js       # Copy / Select All
    │   ├── ModelSelector.js    # Model + formatter dropdowns
    │   ├── StatusCard.js       # Status bar + progress
    │   ├── TiptapEditor.js     # Rich text editor (Tiptap)
    │   └── Toolbar.js          # Editor formatting toolbar
    ├── extensions/
    │   └── TextDirection.js    # Custom Tiptap RTL/LTR extension
    └── hooks/
        ├── useModelLoader.js   # Whisper + WebLLM loading logic
        ├── useRecording.js     # MediaRecorder lifecycle
        └── useStorageSync.js   # Persist model preferences to localStorage
```

---

## License

MIT
