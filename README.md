# RemiAI Open Source Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build: Electron](https://img.shields.io/badge/Build-Electron-blue.svg)](https://www.electronjs.org/)
[![Model: GGUF](https://img.shields.io/badge/Model-GGUF-green.svg)](https://github.com/)
[![TTS: Piper](https://img.shields.io/badge/TTS-Piper-purple.svg)](https://github.com/rhasspy/piper)
[![STT: Whisper](https://img.shields.io/badge/STT-Whisper-orange.svg)](https://github.com/ggerganov/whisper.cpp)

---

## 🚨 IMPORTANT (Project Structure Update)

👉 This repository contains **ONLY SOURCE CODE**

👉 The **FULL WORKING PROJECT (with .exe, .dll, binaries)** is available here:

🔗 **Download from Releases:**
https://github.com/shaikroshan74285/Edge_gallery/releases

> ⚠️ If you want a ready-to-use application → download from Releases
> ⚠️ If you want to modify or learn → use this repository

---

## 🧠 About the Project

**A "No-Setup" Local AI Framework for Students**

This project is an open-source, offline AI application wrapper designed for students and colleges. It allows you to run powerful LLMs (like Llama 3, Mistral, etc.) on your laptop without needing GPU, internet, Python, or complicated installations.

---

## 🌟 Beyond Text Generation

This framework is a **Universal Offline AI Wrapper**. You can use it to build:

* **Text Generation Apps** → Replace `model.gguf`
* **Speech-to-Text (STT) Apps** → Replace `engine/whisper/model.bin`
* **Text-to-Speech (TTS) Apps** → Replace `engine/piper/model.onnx`

All running **100% offline with zero external dependencies**

---

## ⚠️ Important Notes

* No GPU required → runs on CPU
* Only `.gguf` models supported
* `.exe`, `.dll`, models are NOT included in repo
* Full setup is available in **Releases**

---

## 🚀 Quick Start

### ✅ Option 1: Direct Use (Recommended)

1. Go to Releases
2. Download latest `.zip`
3. Extract
4. Run the `.exe`

---

### 💻 Option 2: Run from Source

```bash
git clone https://github.com/shaikroshan74285/Edge_gallery.git
cd Edge_gallery
npm install
npm start
```

---

## 💻 Manual Installation (Source)

### 1. Requirements

* Node.js (LTS) → https://nodejs.org/
* Git → https://git-scm.com/
* Windows Laptop

---

### 2. Setup

1. Clone the repo
2. Install dependencies:

```bash
npm install
```

---

### 3. Run

```bash
npm start
```

---

## 🆕 Features (v2.1)

* Dynamic Resource Management (auto load/unload models)
* Debug logging (`app_debug.log`)
* Improved STT stability
* Manual audio conversion support

---

## 📦 Features

* 💬 AI Chat (Local LLM)
* 🔊 Text-to-Speech (Piper)
* 🎙️ Speech-to-Text (Whisper)
* 🌐 Built-in Web Browser
* ⚡ Works 100% Offline
* 🔒 Privacy First
* 🧠 CPU-based inference (No GPU required)
* ⚙️ Auto optimization (AVX / AVX2 detection)

---

## ⚠️ Capabilities & Limitations

### Supported Formats

* LLM → `.gguf`
* STT → `ggml-*.bin`
* TTS → `.onnx` + `.json`

---

### Packaging Limit

* Tested up to ~3.1GB
* Recommended < 3.5GB

---

### Performance Notes

* Minimum ~4GB RAM required
* Model reload may take 5–10 seconds
* Use "Refresh App" if stuck

---

## 📂 Project Structure

```text
Root/
├── engine/        # AI engines (excluded in repo)
├── bin/           # binaries (excluded)
├── model.gguf     # model (excluded)
├── main.js
├── index.html
├── renderer.js
├── styles.css
├── web.html
├── package.json
```

---

## 🔧 Customization

You can replace:

* `model.gguf` → LLM
* Whisper model → STT
* Piper model → TTS

---

## ❓ Troubleshooting

### Engine Missing Error

Run:

```bash
git lfs install
git lfs pull
```

---

### TTS Issues

* Check `piper.exe`
* Check `.onnx` model

---

### STT Issues

* Ensure `ffmpeg.exe` is present
* Check whisper model

---

## ❓ FAQ

### Do I need Python?

❌ No

---

### Why app not responding?

* Missing model
* Missing binaries
* Incorrect setup

---

## 🛠️ Credits & License

### RemiAI Framework

* Created By: RemiAI Team
* License: MIT

---

### Open Source Components

#### AI Engine

* Llama.cpp → MIT

#### Models

* Gemma 2 → Google DeepMind

#### Speech

* Piper → MIT
* Whisper → MIT

#### Libraries

* Electron
* FFmpeg
* Marked.js
* Lucide
* Systeminformation

---

## ⚡ Final Note

This project is designed for:

* Students
* Offline AI usage
* Low-end laptops

---

👉 For full working application → **Use Releases**
👉 For development → **Use this repository**
