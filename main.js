const { app, BrowserWindow, ipcMain, shell, powerMonitor, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const si = require('systeminformation');

let mainWindow;
let apiProcess;

// --- LOGGING ---
function logToDesktop(message) {
    try {
        const logPath = path.join(app.getPath('desktop'), 'app_debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch (e) {
        // Find a way to notify if logging fails, or just ignore
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 900,
        backgroundColor: '#ffffff',
        icon: path.join(__dirname, 'remiai.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true // RESTORED: This allows your browsing feature to work
        },
        autoHideMenuBar: true,
        title: "RemiAI - bujji"
    });

    mainWindow.loadFile('index.html');

    // --- FEATURE: TASK REMINDER SYSTEM ---
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('check-tasks');
    });

    powerMonitor.on('resume', () => {
        if (mainWindow) mainWindow.webContents.send('check-tasks');
    });

    powerMonitor.on('unlock-screen', () => {
        if (mainWindow) mainWindow.webContents.send('check-tasks');
    });

    // ALLOW INTERNAL NAVIGATION
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        return { action: 'allow' };
    });

    mainWindow.on('closed', function () { mainWindow = null; });
}

// --- AI ENGINE BACKEND LOGIC (STRICT CPU ONLY) ---

async function selectEngine() {
    try {
        const cpuFlags = await si.cpuFlags();
        const flagsStr = JSON.stringify(cpuFlags).toLowerCase();

        const basePath = app.isPackaged ? process.resourcesPath : __dirname;
        const engineBaseDir = path.join(basePath, 'engine');
        const hasFolder = (f) => fs.existsSync(path.join(engineBaseDir, f));

        // 1. Check for AVX2 (Priority for speed)
        if (flagsStr.includes('avx2') && hasFolder('cpu_avx2')) {
            return 'cpu_avx2';
        }

        // 2. Fallback to standard AVX
        return 'cpu_avx';

    } catch (e) {
        return 'cpu_avx';
    }
}

async function startNativeBackend() {
    killProcess();
    await new Promise(resolve => setTimeout(resolve, 500));

    const engineSubfolder = await selectEngine();
    const basePath = app.isPackaged ? process.resourcesPath : __dirname;
    const workingDir = path.join(basePath, 'engine', engineSubfolder);

    let exeName = fs.existsSync(path.join(workingDir, 'bujji_engine.exe'))
        ? 'bujji_engine.exe'
        : 'llama-server.exe';

    const exePath = path.join(workingDir, exeName);

    // --- CHECK FOR GIT LFS POINTERS ---
    try {
        const stats = fs.statSync(exePath);
        if (stats.size < 5000) { // Real engine is >3MB. Pointers are ~130 bytes.
            dialog.showErrorBox(
                "RemiAI Engine Missing",
                `The engine executable is a Git LFS pointer (size: ${stats.size} bytes), not the actual file.\n\nPlease install Git LFS and run: 'git lfs pull'\nOr redownload the 'engine' folder contents correctly.`
            );
            return; // Stop execution
        }
    } catch (err) {
        logToDesktop("Error checking engine file: " + err.message);
    }

    // --- SPEED & CPU CONTROL ---
    // Your i5 has 8 logical threads. 
    // Setting this to 4 uses 50% of your CPU capacity, ensuring fast 3-4s responses.
    const optimizedThreads = 4;

    const args = [
        '-m', '../model.gguf',
        '-c', '2048',             // Keeps memory usage low and response snappy
        '--batch-size', '512',   // Increases prompt processing speed
        '--port', '5000',
        '-t', optimizedThreads.toString(),
        '--n-gpu-layers', '0',   // Forced CPU only
        '--no-mmap'              // Pre-loads model into RAM for zero lag
    ];

    try {
        logToDesktop(`Starting backend: ${exePath}`);
        apiProcess = spawn(exePath, args, {
            cwd: workingDir,
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        apiProcess.stderr.on('data', (data) => logToDesktop(`[Backend] ${data.toString()}`));
    } catch (e) {
        logToDesktop(`Catch Error: ${e.message}`);
    }
}

function killProcess() {
    try {
        exec('taskkill /IM bujji_engine.exe /F /T');
        exec('taskkill /IM llama-server.exe /F /T');
    } catch (e) { }
}

ipcMain.on('restart-brain', () => {
    startNativeBackend();
    if (mainWindow) mainWindow.webContents.send('brain-restarted');
});

ipcMain.on('reload-window', () => {
    if (mainWindow) mainWindow.reload();
});

// --- TTS (TEXT-TO-SPEECH) via PIPER ---

ipcMain.handle('tts-synthesize', async (event, text) => {
    return new Promise((resolve, reject) => {
        const basePath = app.isPackaged ? process.resourcesPath : __dirname;
        const engineSubfolder = fs.existsSync(path.join(basePath, 'engine', 'cpu_avx2'))
            ? 'cpu_avx2' : 'cpu_avx';
        const workingDir = path.join(basePath, 'engine', engineSubfolder);
        const piperExe = path.join(workingDir, 'piper.exe');
        const modelPath = path.join(basePath, 'engine', 'piper', 'en_US-lessac-medium.onnx');
        const outputPath = path.join(os.tmpdir(), `tts_output_${Date.now()}.wav`);

        if (!fs.existsSync(piperExe)) {
            return reject(new Error('Piper TTS executable not found'));
        }
        if (!fs.existsSync(modelPath)) {
            return reject(new Error('Piper TTS model not found'));
        }

        const args = [
            '--model', modelPath,
            '--output_file', outputPath
        ];

        try {
            const piperProcess = spawn(piperExe, args, {
                cwd: workingDir,
                windowsHide: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stderrOutput = '';
            piperProcess.stderr.on('data', (data) => {
                stderrOutput += data.toString();
            });

            piperProcess.on('close', (code) => {
                if (code === 0 && fs.existsSync(outputPath)) {
                    resolve(outputPath);
                } else {
                    reject(new Error(`Piper exited with code ${code}: ${stderrOutput}`));
                }
            });

            piperProcess.on('error', (err) => {
                reject(new Error(`Failed to start Piper: ${err.message}`));
            });

            // Pipe text input to piper's stdin
            piperProcess.stdin.write(text);
            piperProcess.stdin.end();

        } catch (e) {
            reject(new Error(`TTS Error: ${e.message}`));
        }
    });
});

ipcMain.handle('tts-save-file', async (event, sourcePath) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Audio File',
        defaultPath: `speech_${Date.now()}.wav`,
        filters: [
            { name: 'WAV Audio', extensions: ['wav'] }
        ]
    });
    if (result.canceled || !result.filePath) return null;
    try {
        fs.copyFileSync(sourcePath, result.filePath);
        return result.filePath;
    } catch (err) {
        throw new Error(`Failed to save: ${err.message}`);
    }
});

// --- DYNAMIC BACKEND MANAGEMENT ---

ipcMain.on('feature-switched', (event, featureName) => {
    logToDesktop(`[Feature Switch] Switched to: ${featureName}`);
    if (featureName === 'chat' || featureName === 'games' || featureName === 'habits' || featureName === 'fashion' || featureName === 'astro' || featureName === 'productivity' || featureName === 'breathing') {
        // These features need the LLM backend
        if (!apiProcess || apiProcess.killed) {
            logToDesktop(`[Backend] Restarting for feature: ${featureName}`);
            startNativeBackend();
        }
    } else {
        // Features like TTS, STT, and Web Browser should NOT have the LLM running to save resources
        if (apiProcess && !apiProcess.killed) {
            logToDesktop(`[Backend] Stopping for feature: ${featureName}`);
            killProcess();
            apiProcess = null;
        }
    }
});

// --- STT (SPEECH-TO-TEXT) via WHISPER ---

ipcMain.handle('stt-select-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Audio File',
        filters: [
            { name: 'Audio Files', extensions: ['wav', 'mp3', 'm4a', 'ogg', 'flac'] }
        ],
        properties: ['openFile']
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
});

ipcMain.handle('stt-transcribe', async (event, audioFilePath) => {
    logToDesktop(`[STT] Starting transcription for: ${audioFilePath}`);
    const basePath = app.isPackaged ? process.resourcesPath : __dirname;
    const engineSubfolder = fs.existsSync(path.join(basePath, 'engine', 'cpu_avx2'))
        ? 'cpu_avx2' : 'cpu_avx';
    const workingDir = path.join(basePath, 'engine', engineSubfolder);
    const whisperExe = path.join(workingDir, 'whisper.exe');
    const modelPath = path.join(basePath, 'engine', 'whisper', 'ggml-base.en.bin');

    logToDesktop(`[STT] Working Dir: ${workingDir}`);
    logToDesktop(`[STT] Whisper Exe: ${whisperExe}`);

    if (!fs.existsSync(whisperExe)) throw new Error('Whisper STT executable not found');
    if (!fs.existsSync(modelPath)) throw new Error('Whisper STT model not found');
    if (!fs.existsSync(audioFilePath)) throw new Error('Audio file not found');

    const WHISPER_PORT = 5001;

    // 1. Prepare environment (FFMPEG)
    // Copy ffmpeg.exe to workingDir if not present, to ensure local execution
    const binPath = path.join(basePath, 'bin');
    const ffmpegSrc = path.join(binPath, 'ffmpeg.exe');
    const ffmpegDest = path.join(workingDir, 'ffmpeg.exe');

    // Add bin/ to PATH
    let envPath = process.env.PATH || '';
    if (!envPath.includes(binPath)) {
        envPath = `${binPath}${path.delimiter}${envPath}`;
    }

    try {
        if (!fs.existsSync(ffmpegDest) && fs.existsSync(ffmpegSrc)) {
            logToDesktop(`[STT] Copying ffmpeg to working dir`);
            fs.copyFileSync(ffmpegSrc, ffmpegDest);
        }
    } catch (e) {
        logToDesktop(`[STT] Failed to copy ffmpeg: ${e.message}`);
    }

    // --- MANUAL AUDIO CONVERSION ---
    // Convert input audio to 16kHz mono WAV using ffmpeg explicitly
    const convertedWavPath = path.join(os.tmpdir(), `stt_converted_${Date.now()}.wav`);
    logToDesktop(`[STT] Converting audio to: ${convertedWavPath}`);

    try {
        await new Promise((resolve, reject) => {
            const ffmpegArgs = [
                '-y',
                '-i', audioFilePath,
                '-ar', '16000',
                '-ac', '1',
                '-c:a', 'pcm_s16le',
                convertedWavPath
            ];

            const ffmpegProc = spawn(ffmpegDest, ffmpegArgs, {
                windowsHide: true,
                stdio: ['ignore', 'pipe', 'pipe']
            });

            let ffmpegStderr = '';
            ffmpegProc.stderr.on('data', d => ffmpegStderr += d.toString());

            ffmpegProc.on('close', (code) => {
                if (code === 0 && fs.existsSync(convertedWavPath)) {
                    resolve();
                } else {
                    reject(new Error(`FFmpeg conversion failed (code ${code}): ${ffmpegStderr}`));
                }
            });

            ffmpegProc.on('error', (err) => reject(err));
        });
        logToDesktop(`[STT] Audio conversion successful.`);
    } catch (e) {
        logToDesktop(`[STT] Audio conversion failed: ${e.message}`);
        throw new Error(`Audio conversion failed. Please ensure the file is valid.`);
    }


    // 2. Start whisper server
    const args = [
        '-m', modelPath,
        '--host', '127.0.0.1',
        '--port', WHISPER_PORT.toString(),
        // '--convert', // DISABLED: We handle conversion manually now
        '-nt'
    ];

    let whisperServer = null;
    let serverStderr = '';

    try {
        logToDesktop(`[STT] Spawning Whisper Server...`);
        whisperServer = spawn(whisperExe, args, {
            cwd: workingDir,
            windowsHide: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, PATH: envPath }
        });

        whisperServer.stderr.on('data', (data) => {
            const msg = data.toString();
            serverStderr += msg;
            logToDesktop(`[Whisper Stderr] ${msg}`);
        });

        // 3. Wait for server to be ready (poll health endpoint)
        const maxWaitMs = 30000;
        const startTime = Date.now();
        let serverReady = false;
        while (Date.now() - startTime < maxWaitMs) {
            try {
                const http = require('http');
                await new Promise((resolve, reject) => {
                    const req = http.get(`http://127.0.0.1:${WHISPER_PORT}/`, (res) => {
                        resolve(true);
                    });
                    req.on('error', () => resolve(false));
                    req.setTimeout(500, () => { req.destroy(); resolve(false); });
                }).then(ok => { if (ok) serverReady = true; });
                if (serverReady) break;
            } catch (e) { }
            await new Promise(r => setTimeout(r, 500));
        }

        if (!serverReady) {
            logToDesktop(`[STT] Server failed to start. Last stderr: ${serverStderr}`);
            throw new Error(`Whisper server failed to start: ${serverStderr}`);
        }

        logToDesktop(`[STT] Server ready. Sending audio...`);

        // 4. POST audio file to inference endpoint
        const http = require('http');
        const audioData = fs.readFileSync(convertedWavPath); // USE CONVERTED FILE
        const fileName = "input.wav";
        const boundary = '----WhisperFormBoundary' + Date.now();

        // Build multipart form data
        const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: audio/wav\r\n\r\n`;
        const footer = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\ntext\r\n--${boundary}--\r\n`;

        const headerBuf = Buffer.from(header, 'utf-8');
        const footerBuf = Buffer.from(footer, 'utf-8');
        const body = Buffer.concat([headerBuf, audioData, footerBuf]);

        const transcription = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: '127.0.0.1',
                port: WHISPER_PORT,
                path: '/inference',
                method: 'POST',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    'Content-Length': body.length
                },
                timeout: 120000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    logToDesktop(`[STT] Response received: ${data.substring(0, 100)}...`);
                    try {
                        // Try parsing as JSON first
                        const json = JSON.parse(data);
                        const text = json.text || json.transcription || '';
                        resolve(text.trim());
                    } catch (e) {
                        // If not JSON, use raw text
                        resolve(data.trim());
                    }
                });
            });
            req.on('error', err => reject(new Error(`Request failed: ${err.message}`)));
            req.on('timeout', () => { req.destroy(); reject(new Error('Transcription timed out.')); });
            req.write(body);
            req.end();
        });

        if (!transcription) {
            logToDesktop(`[STT] No transcription result.`);
            throw new Error('No speech detected. Make sure the file contains clear English speech.');
        }
        return transcription;

    } catch (err) {
        logToDesktop(`[STT] Error: ${err.message}`);
        throw err;
    } finally {
        // 5. Cleanup
        if (whisperServer) {
            try { whisperServer.kill(); } catch (e) { }
            try { exec(`taskkill /PID ${whisperServer.pid} /F /T`); } catch (e) { }
        }
        try { if (fs.existsSync(convertedWavPath)) fs.unlinkSync(convertedWavPath); } catch (e) { }
    }
});

// --- APP LIFECYCLE ---

app.whenReady().then(() => {
    startNativeBackend();
    createWindow();
});

app.on('window-all-closed', () => {
    killProcess();
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => { killProcess(); });