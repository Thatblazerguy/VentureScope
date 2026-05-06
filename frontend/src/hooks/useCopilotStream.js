import { useRef, useState } from 'react';
import { streamCopilotMessage } from '../lib/api';

export function useCopilotStream() {
  const abortRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  async function sendMessage(message, onChunk, onComplete) {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setIsStreaming(true);

    try {
      const result = await streamCopilotMessage({
        message,
        signal: controller.signal,
        onChunk,
      });
      onComplete?.(result);
      return result;
    } catch (streamError) {
      if (streamError.name !== 'AbortError') {
        setError(streamError.message || 'Unable to reach Venture Copilot');
      }
      throw streamError;
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function cancel() {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setIsStreaming(false);
    }
  }

  return {
    isStreaming,
    error,
    sendMessage,
    cancel,
  };
}