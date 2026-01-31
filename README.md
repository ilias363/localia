# Localia

A local AI chat application built with React Native and Expo. Run large language models (LLMs) directly on your device with complete privacy - no internet required.

## Features

- **100% Local Inference** - All AI processing happens on your device using [llama.rn](https://github.com/mybigday/llama.rn)
- **Multiple Models** - Choose from various TinyLlama GGUF quantizations (Q2_K to Q8_0)
- **Model Manager** - Download, import, and manage models with search and sort functionality
- **Streaming Responses** - Real-time text generation with animated UI
- **Conversation History** - Persistent chat storage with MMKV
- **Custom Model Import** - Add your own GGUF models from device storage
- **Dark/Light Theme** - System-aware theming

## Tech Stack

- **Framework**: React Native + Expo Router
- **LLM Runtime**: llama.rn (GGUF format)
- **State Management**: Zustand with MMKV persistence
- **Animations**: React Native Reanimated
- **UI**: Custom themed components with haptic feedback

## Getting Started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm expo start
   ```

3. Run on your device/emulator:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go

## Usage

1. Open the **Model Manager** from the side drawer
2. Download a model (smaller quantizations like Q2_K are faster to download)
3. Tap the play button to load the model
4. Return to chat and start conversing!
