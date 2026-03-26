# Student & Developer Documentation

## Overview
Welcome to the RemiAI Framework! This document is designed to help you understand how to customize, configure, and make this application your own. This framework is built to be "Plug-and-Play"—meaning you don't need to know Python or complex AI coding to use it. It includes **Text Generation** (chat with AI), **Text-to-Speech** (TTS — convert text to voice), and **Speech-to-Text** (STT — extract text from audio files), all running 100% offline.

## 🛠️ Setup & How to Customize

### 0. Quick Setup (Important!)
Before running the app, you **must** ensure the AI engine files are downloaded correctly. GitHub does not store large files directly, so we use **Git LFS**.

**For PowerShell:**
```powershell
git clone https://huggingface.co/datasets/remiai3/REMI_Framework_V2
cd REMI_Framework_V2
git lfs install
git lfs pull
npm install
npm start
```

**For Command Prompt (CMD):**
```cmd
git clone https://huggingface.co/datasets/remiai3/REMI_Framework_V2
cd REMI_Framework_V2
git lfs install
git lfs pull
npm install
npm start
```

### 1. Changing the AI Name
Want to name the AI "Jarvis" or "MyBot"?
1.  Open `index.html` in any text editor (VS Code, Notepad, etc.).
2.  Search for "RemiAI" or "Bujji".
3.  Replace the text with your desired name.
4.  Save the file.
5.  Restart the app (`npm start`), and your new name will appear!

### 2. Replacing the AI Models (LLM, TTS, STT)
This framework is a **Universal Wrapper**. You can swap out any of the three "brains" (Text, Speech, Hearing) to build your own dedicated application.

#### Component Reference Table
| Feature | Engine Binary | Model File | Model Location | Format |
| :--- | :--- | :--- | :--- | :--- |
| **Chat (LLM)** | `bujji_engine.exe` | `model.gguf` | Root Folder (`/`) | `.gguf` |
| **TTS (Speech)** | `piper.exe` | `en_US-lessac-medium.onnx` | `engine/piper/` | `.onnx` + `.json` |
| **STT (Hearing)** | `whisper.exe` | `ggml-base.en.bin` | `engine/whisper/` | `.bin` (GGML) |

#### A. Changing the Chat Model (Text Generation)
1.  **Download**: Get a `.gguf` model from Hugging Face (e.g., `Llama-3-8B-GGUF`).
2.  **Rename**: Rename it to `model.gguf`.
3.  **Replace**: Overwrite the existing `model.gguf` in the root folder.
4.  **Restart**: Run `npm start`.

#### B. Changing the Text-to-Speech (TTS) Voice
The framework uses **Piper TTS**.
1.  **Download**: Get a voice model (`.onnx`) and its config (`.json`) from [Piper Voices](https://github.com/rhasspy/piper/blob/master/VOICES.md).
2.  **Place Files**: Put both files in `engine/piper/`.
3.  **Update Code**:
    *   Open `main.js`.
    *   Search for: `engine/piper/en_US-lessac-medium.onnx`
    *   Replace the filename with your new `.onnx` file name.
4.  **Restart**: Run `npm start`.

#### C. Changing the Speech-to-Text (STT) Engine
The framework uses **Whisper.cpp**.
1.  **Download**: Get a model in GGML/Binary format (`ggml-*.bin`) from [Hugging Face (ggerganov/whisper.cpp)](https://huggingface.co/ggerganov/whisper.cpp).
2.  **Place File**: Put the file in `engine/whisper/`.
3.  **Update Code**:
    *   Open `main.js`.
    *   Search for: `engine/whisper/ggml-base.en.bin`
    *   Replace the filename with your new `.bin` file name.
4.  **Restart**: Run `npm start`.

**Hardware Warning**:
*   **Good Configuration**: i3 (8GB RAM) for basic usage.
*   **Recommended**: i5 (16GB RAM) for larger models.

### 3. Customizing the UI
All styles are in `styles.css` (or within `index.html`).
*   **Colors**: Change the background colors or chat bubble colors in the CSS.
*   **Icons**: Replace `remiai.ico` with your own `.ico` file to change the app icon.

### 4. Application Utilities
The framework bundles essential utilities in the `bin/` folder to ensure it runs without external dependencies:
*   **ffmpeg.exe**: Converts various audio formats (`.mp3`, `.ogg`) into the `.wav` format required by the STT engine.
*   **ffplay.exe**: Helper to play back audio if needed.
*   **ffmpeg.dll**: Runtime library for FFmpeg.

### 5. Dynamic Resource Management (New!)
To ensure the application runs smoothly even on lower-end devices:
*   **Behavior**: When you are in the **Chat** tab, the heavy AI model (Text Generation) is loaded into RAM.
*   **Optimization**: When you switch to **TTS**, **STT**, or **Web Browser** tabs, the main AI model is **automatically unloaded**. This frees up RAM and CPU.
*   **Reloading**: When you switch back to the **Chat** tab, the model automatically restarts.

## ⚖️ Licenses & Legal

### RemiAI Framework
The RemiAI Framework code is licensed under the **MIT License**.

### Third-Party Components
This application bundles several open-source components with their own licenses:

1.  **AI Engine (Llama.cpp / bujji_engine.exe)**: [MIT License](https://github.com/ggerganov/llama.cpp/blob/master/LICENSE)
2.  **Piper TTS**: [MIT License](https://github.com/rhasspy/piper/blob/master/LICENSE)
3.  **Whisper.cpp**: [MIT License](https://github.com/ggerganov/whisper.cpp/blob/master/LICENSE)
4.  **FFmpeg**: [LGPL v2.1+](https://www.ffmpeg.org/legal.html)

### Gemma 2 Model Terms
This application works with the **Gemma 2** model from Google. By using this model, you agree to the **Gemma Terms of Use**.

**Gemma Terms of Use Summary**:
*   **Permitted Use**: You may use Gemma for commercial and non-commercial purposes.
*   **Restrictions**: You must not use Gemma for restricted use cases (e.g., generating hate speech, sexually explicit content, or dangerous activities).
*   **Attribution**: You must include attribution to Google when distributing Gemma or derivatives.

[Read the full Gemma Terms of Use here](https://ai.google.dev/gemma/terms)

---

## ❓ Frequently Asked Questions (FAQ)

**Q: Do I need Python?**
A: **No.** The application comes with a pre-compiled engine (`bujji_engine.exe`) that runs the model directly.

**Q: The app opens but doesn't reply / "RemiAI Engine Missing" Error.**
A: 
1.  **Git LFS Issue**: This usually means you downloaded "pointers" (tiny files) instead of the real engine. Open a terminal in the folder and run `git lfs pull`.
2.  **Model Issue**: Check if `model.gguf` exists in the `engine` folder.

**Q: I see "Content Security Policy" warnings in the console.**
A: We have configured safeguards (`index.html` meta tags) to block malicious scripts. The CSP is set to only allow local resources (`'self'`) and the local API server (`127.0.0.1:5000`).

**Q: How do I build it into an .exe file?**
A: Run the command:
```bash
npm run dist
```
This will create an installer in the `release` folder that you can share with friends! 
`if you are facing errors while building open the power shell as an administrator and run the above command then it will works 100%`
