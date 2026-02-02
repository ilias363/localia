/**
 * High-performance token buffer for optimized UI updates during LLM streaming.
 *
 * This utility batches token callbacks and syncs UI updates with the render cycle
 * using requestAnimationFrame, preventing UI freezes while maintaining smooth UX.
 *
 * Key optimizations:
 * - Batches tokens to reduce store update frequency
 * - Uses RAF to sync with the 60fps render cycle
 * - Adaptive flushing based on content accumulation
 * - Zero throttling/debouncing for instant responsiveness
 */

import { InteractionManager } from "react-native";

interface TokenBufferConfig {
  /** Callback invoked with accumulated content */
  onFlush: (content: string) => void;
  /** Optional callback invoked when buffer is reset */
  onReset?: () => void;
  /** Maximum tokens to buffer before forcing a flush (default: 4) */
  maxTokens?: number;
  /** Maximum characters to buffer before forcing a flush (default: 20) */
  maxChars?: number;
}

export class TokenBuffer {
  private buffer: string = "";
  private tokenCount: number = 0;
  private rafHandle: number | null = null;
  private config: Required<TokenBufferConfig>;
  private isActive: boolean = false;

  constructor(config: TokenBufferConfig) {
    this.config = {
      maxTokens: config.maxTokens ?? 4,
      maxChars: config.maxChars ?? 20,
      onFlush: config.onFlush,
      onReset: config.onReset ?? (() => { }),
    };
  }

  /**
   * Add a token to the buffer. Will automatically flush based on heuristics.
   */
  add(token: string): void {
    this.buffer += token;
    this.tokenCount++;

    // Flush immediately if we've accumulated enough content
    if (this.tokenCount >= this.config.maxTokens || this.buffer.length >= this.config.maxChars) {
      this.flushImmediate();
      return;
    }

    // Otherwise, schedule a RAF flush if not already scheduled
    this.scheduleFlush();
  }

  /**
   * Schedule a flush on the next animation frame.
   */
  private scheduleFlush(): void {
    if (this.rafHandle !== null || !this.isActive) return;

    this.rafHandle = requestAnimationFrame(() => {
      this.rafHandle = null;
      if (this.buffer) {
        this.flushImmediate();
      }
    });
  }

  /**
   * Immediately flush the buffer without waiting for RAF.
   */
  private flushImmediate(): void {
    if (!this.buffer) return;

    const content = this.buffer;
    this.buffer = "";
    this.tokenCount = 0;

    // Use InteractionManager to defer the store update if UI is busy
    // This ensures smooth animations/gestures aren't interrupted
    InteractionManager.runAfterInteractions(() => {
      this.config.onFlush(content);
    });
  }

  /**
   * Force flush any remaining content in the buffer.
   */
  flush(): void {
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    this.flushImmediate();
  }

  /**
   * Clear the buffer and cancel any pending flushes.
   */
  reset(): void {
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    this.buffer = "";
    this.tokenCount = 0;
    this.config.onReset();
  }

  /**
   * Start accepting tokens and scheduling flushes.
   */
  start(): void {
    this.isActive = true;
  }

  /**
   * Stop accepting tokens and cancel any pending flushes.
   */
  stop(): void {
    this.isActive = false;
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  /**
   * Get the current buffered content without flushing.
   */
  peek(): string {
    return this.buffer;
  }
}

/**
 * Convenience function to create and manage token buffers with automatic cleanup.
 */
export function createTokenBuffer(config: TokenBufferConfig): TokenBuffer {
  return new TokenBuffer(config);
}
