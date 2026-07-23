# Localia

A local AI chat application built with React Native and Expo. Run large language models (LLMs) directly on your device with complete privacy - no internet required.

## Features

- **100% Local Inference** - All AI processing happens on your device using [llama.rn](https://github.com/mybigday/llama.rn)
- **Multiple Models** - Browse and run multiple bundled GGUF models including TinyLlama, Qwen, SmolLM2, and Llama
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

2. Start the development server

   ```bash
   pnpm start
   ```

3. Run on your device/emulator with a development build:
   - Press `a` for Android
   - Press `i` for iOS
   - Or run `pnpm android` / `pnpm ios`

> Note: This app uses native modules such as `llama.rn`, so Expo Go is not supported.

## GitHub Releases APK

This project is configured to publish an Android APK to GitHub Releases with Expo Application Services (EAS).

### 1. Create an Expo access token

- Go to the Expo account settings page: https://expo.dev/accounts/your-username/settings/access-tokens
- Create a token with permission to run EAS builds

### 2. Add the token to GitHub

- In your GitHub repository, open **Settings > Secrets and variables > Actions**
- Add a repository secret named `EXPO_TOKEN`

### 3. Push a version tag

The release workflow runs when you push a tag that starts with `v`.

Example:

```bash
git tag v1.3.0
git push origin v1.3.0
```

### 4. What happens automatically

- GitHub Actions starts an EAS Android build using the `github-release` profile
- EAS produces an installable APK
- GitHub creates a Release for that tag
- The APK is attached to the Release assets

## Usage

1. Open the **Model Manager** from the side drawer
2. Download a model (smaller quantizations like Q2_K are faster to download but less accurate)
3. Tap the play button to load the model
4. Return to chat and start conversing!
