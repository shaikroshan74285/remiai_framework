# RemiAI Open Source Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build: Electron](https://img.shields.io/badge/Build-Electron-blue.svg)](https://www.electronjs.org/)
[![Model: GGUF](https://img.shields.io/badge/Model-GGUF-green.svg)](https://huggingface.co/)
[![TTS: Piper](https://img.shields.io/badge/TTS-Piper-purple.svg)](https://github.com/rhasspy/piper)
[![STT: Whisper](https://img.shields.io/badge/STT-Whisper-orange.svg)](https://github.com/ggerganov/whisper.cpp)

**A "No-Setup" Local AI Framework for Students**

This project is an open-source, offline AI application wrapper designed for students and colleges. It allows you to run powerful LLMs (like Llama 3, Mistral, etc.) on your laptop without needing GPU, internet, Python, or complicated installations.

**Repository Link:** [https://huggingface.co/datasets/remiai3/REMI_Framework_V2](https://huggingface.co/datasets/remiai3/REMI_Framework_V2)

**Beyond Text Generation:**
This framework is a **Universal Offline AI Wrapper**. You can use it to build dedicated:
*   **Text Generation Apps**: (Clone & Replace `model.gguf`)
*   **Speech-to-Text (STT) Apps**: (Clone & Replace `engine/whisper/model.bin`)
*   **Text-to-Speech (TTS) Apps**: (Clone & Replace `engine/piper/model.onnx`)

All running 100% offline with zero external dependencies.

**Note** - No need any GPU in your laptop to run, it will use the CPU in your laptop for the response generation (inference). If you want to modify the project code and use another model make sure that your are using the `.gguf` formated weights only. Normal weights like `.safetensors` or `.bin` (PyTorch) will NOT work.

**New in v2.1:**
*   **Dynamic Resource Management**: To save CPU/RAM, the massive Text Generation model now automatically unloads when you switch to STT, TTS, or Web Browser tabs. It reloads when you return to Chat.
*   **Debug Logging**: If issues arise in the packaged app, check the `app_debug.log` file created on your Desktop.
*   **Manual Audio Conversion**: Enhanced STT stability by auto-converting audio formats before processing.
*   **Known Issue**: Sometimes after switching back to Chat from other tabs, the status says "Connecting..." indefinitely. **Fix: Click the "Refresh App" button in the sidebar.**
---

## 🚀 Quick Start (One-Line Command)

If you have Git and Node.js installed, open your terminal and run the following commands.

### For PowerShell (Windows)
Copy and paste this entire block into PowerShell:

```powershell
git clone https://huggingface.co/datasets/remiai3/REMI_Framework_V2
cd REMI_Framework_V2
git lfs install
git lfs pull
npm install
npm start
```

### For Command Prompt (CMD)
Copy and paste this entire block into Command Prompt:

```cmd
git clone https://huggingface.co/datasets/remiai3/REMI_Framework_V2
cd REMI_Framework_V2
git lfs install
git lfs pull
npm install
npm start
```

### ⚠️ IMPORTANT: Git LFS Required
This repository uses **Git Large File Storage (LFS)** for the AI engine binaries.
**If you download the ZIP or clone without LFS, the app will not work (Error: "RemiAI engine missing").**

---

## 💻 Manual Installation

### 1. Requirements
*   **Node.js**: [Download Here](https://nodejs.org/) (Install the LTS version).
*   **Git & Git LFS**: [Download Git](https://git-scm.com/) | [Download Git LFS](https://git-lfs.com/)
*   **Windows Laptop**: (Code includes optimized `.exe` binaries for Windows).

### 2. Download & Setup
1.  **Download** the project zip (or clone the repo).
2.  **Extract** the folder.
3.  **Open Terminal** inside the folder path.
4.  **Pull Engine Files** (Critical Step):
    ```bash
    git lfs install
    git lfs pull
    ```
5.  Run the installer for libraries:
    ```bash
    npm install
    ```

### 3. Run the App
Simply type:
```bash
npm start
```
The application will launch, the AI engine will start in the background, and you can begin chatting immediately!

---

## 📦 Features

*   **💬 AI Chat (Text Generation)**: Chat with powerful LLMs running locally on your CPU.
*   **Zero Python Dependency**: We use compiled binaries (`.dll` and `.exe` included) so you don't need to install Python, PyTorch, or set up virtual environments.
*   **Plug & Play Models**: Supports `.gguf` format.
    *   Want a different model? Download any `.gguf` file, rename it to `model.gguf`, and place it in the project root.
*   **Auto-Optimization**: Automatically detects your CPU features (AVX vs AVX2) to give you the best speed possible.
*   **Privacy First**: Runs 100% offline. No data leaves your device.
*   **Dynamic Resource Loading**: Automatically unloads heavy AI models when not in use (e.g., when using Browser or TTS) to free up system resources.
*   **🔊 Text-to-Speech (TTS)**: Convert any text to natural-sounding English speech using the **Piper** engine.
    *   Click the speaker icon in the sidebar → type text → click "Speak" → listen and download `.wav` files.
    *   Voice model: `en_US-lessac-medium.onnx` (replaceable with other Piper voices).
*   **🎙️ Speech-to-Text (STT)**: Extract text from audio files using the **Whisper** engine.
    *   Click the microphone icon in the sidebar → browse for audio file → click "Transcribe" → copy result text.
    *   Supports: `.wav`, `.mp3`, `.m4a`, `.ogg`, `.flac` formats.
    *   Requires `ffmpeg.exe` and `ffmpeg.dll` in the `bin/` folder.
*   **🌐 Built-in Web Browser**: Integrated browser with tabs, bookmarks, and navigation.
*   **🎨 Offline UI**: All icons (Lucide) and libraries (Marked.js) are bundled locally — no CDN required.

## ⚠️ Capabilities & Limitations

*   **Supported AI Types**:
    *   **LLMs**: Supports `.gguf` format only.
    *   **STT**: Supports `ggml-*.bin` format (Whisper).
    *   **TTS**: Supports `.onnx` + `.json` format (Piper).
*   **Packaging Limit**:
    *   The framework uses **NSISBI** (Large Installer Support).
    *   **Tested Packaging Size**: Up to **~3.1GB** successfully.
    *   *Note: While larger sizes (4GB+) may work, we recommend keeping your total app size (Code + Engine + Models) under 3.5GB for best performance and stability on student laptops.*
*   **Memory Usage**: Requires ~4GB RAM free minimum. The app dynamically manages memory by unloading the LLM when using STT/TTS.
*   **Startup Time**: The Chat model may take 5-10 seconds to reload when switching back from other tabs. If it gets stuck, use the "Refresh App" button.

---

## 📂 Project Structure & Dependencies

### Core Structure
```text
Root/
├── engine/                     # AI Backend Engines (Binaries & DLLs)
│   ├── cpu_avx/                # Fallback binaries (AVX)
│   │   ├── bujji_engine.exe    # LLM inference server
│   │   ├── piper.exe           # TTS engine
│   │   └── whisper.exe         # STT server
│   ├── cpu_avx2/               # High-performance binaries (AVX2)
│   │   ├── bujji_engine.exe
│   │   ├── piper.exe
│   │   └── whisper.exe
│   ├── piper/                  # TTS model & config
│   │   └── en_US-lessac-medium.onnx
│   └── whisper/                # STT model
│       └── ggml-base.en.bin
├── bin/                        # Utility binaries
│   ├── ffmpeg.exe              # Audio conversion (required for STT)
│   ├── ffmpeg.dll              # FFmpeg library
│   └── ffplay.exe              # Audio playback
├── assets/icons/               # Local SVG icons
├── model.gguf                  # The AI Model (Must be named exactly this)
├── main.js                     # Core Logic (Main Process)
├── index.html                  # UI Layer
├── renderer.js                 # Frontend Logic
├── styles.css                  # Styling
├── web.html                    # Built-in Web Browser
└── package.json                # Dependencies
```

### Key Libraries & DLLs
*   **Electron**: The core framework for the desktop app.
*   **Systeminformation**: Used for hardware detection (AVX/AVX2).
*   **Marked**: Markdown parser for rendering chat responses.
*   **Lucide**: Open-source icon set.
*   **Engine DLLs**: `piper_phonemize.dll`, `onnxruntime.dll`, `espeak-ng.dll`, `whisper.dll`, `ggml.dll`, `ffmpeg.dll`.

---

## ❓ Troubleshooting

**Error: "RemiAI Engine Missing"**
This means you downloaded the "pointer" files (130 bytes) instead of the real engine.
**Fix**:
1.  Open terminal in project folder.
2.  Run `git lfs install`
3.  Run `git lfs pull`
4.  Restart the app.

**Error: "Piper TTS executable not found" or "Piper TTS model not found"**
*   Ensure `piper.exe` is in `engine/cpu_avx2/` (or `engine/cpu_avx/`).
*   Ensure `en_US-lessac-medium.onnx` is in `engine/piper/`.
*   Run `git lfs pull` to download all engine binaries.

**Error: "Whisper server failed to start"**
*   Ensure `whisper.exe` is in `engine/cpu_avx2/` (or `engine/cpu_avx/`).
*   **Critical**: Ensure `ffmpeg.exe` and `ffmpeg.dll` are in the `bin/` folder. The Whisper server requires FFmpeg.
*   Run `git lfs pull` to download all engine binaries.

**Error: "No speech detected"**
*   Ensure your audio file contains clear English speech.
*   Try with a `.wav` file first for best results.

---

## 🛠️ Credits & License

### RemiAI Framework
*   **Created By**: RemiAI Team
*   **License**: **MIT License**
    *   *You are free to rename, modify, and distribute this application as your own project!*
    *   [View Full License](https://opensource.org/licenses/MIT)

### Open Source Components & Licenses
This project proudly uses the following open-source software:

#### 1. AI Engine (Backend)
*   **Component**: **Llama.cpp** (compiled as `bujji_engine.exe`)
*   **Credits**: [Georgi Gerganov](https://github.com/ggerganov) & Contributors
*   **License**: **MIT License**
*   *This software uses the Llama.cpp library for high-performance LLM inference on CPU.*

#### 2. AI Models
*   **Model**: **Gemma 2** (Google DeepMind)
*   **License**: **Gemma Terms of Use**
*   *By using the Gemma 2 model, you agree to comply with the [Gemma Terms of Use](https://ai.google.dev/gemma/terms).*
*   **Attribution**: This application uses the Gemma 2 model weights in GGUF format.

#### 3. Speech Technologies
*   **Text-to-Speech**: **Piper TTS** (Rhasspy)
    *   **License**: **MIT License**
    *   [View Repository](https://github.com/rhasspy/piper)
*   **Speech-to-Text**: **Whisper.cpp** (Georgi Gerganov)
    *   **License**: **MIT License**
    *   [View Repository](https://github.com/ggerganov/whisper.cpp)

#### 4. Core Libraries
*   **Electron**: MIT License (OpenJS Foundation)
*   **FFmpeg**: LGPL v2.1+ (Fabrice Bellard & Contributors)
*   **Marked.js**: MIT License (Christopher Jeffrey)
*   **Lucide Icons**: ISC License (Lucide Contributors)
*   **Systeminformation**: MIT License (Sebastian Hildebrandt)

---

**Note on Models**: The application strictly uses `.gguf` formatted weights to ensure CPU-friendly performance without requiring a GPU.

## ❓ Frequently Asked Questions (FAQ)

**Q: Do I need Python?**
A: **No.** The application comes with a pre-compiled engine (`bujji_engine.exe`) that runs the model directly.

**Q: The app opens but doesn't reply / "RemiAI Engine Missing" Error.**
A: 
1.  **Git LFS Issue**: This usually means you downloaded "pointers" (tiny files) instead of the real engine. Open a terminal in the folder and run `git lfs pull`.
2.  **Model Issue**: Check if `model.gguf` exists in the `project root` folder.

