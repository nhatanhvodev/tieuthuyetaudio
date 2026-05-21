"use client";

import { useCallback, useRef, useState } from "react";
import { CHUNK_SIZE } from "@/lib/upload/constants";

type UploadState = {
  uploading: boolean;
  progress: number; // 0-100
  error: string;
  url: string;
};

type UploadOptions = {
  onProgress?: (progress: number) => void;
  onComplete?: (url: string) => void;
  onError?: (error: string) => void;
};

export function useChunkedUpload(options: UploadOptions = {}) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: "",
    url: ""
  });

  const abortRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (file: File) => {
      abortRef.current = new AbortController();
      setState({ uploading: true, progress: 0, error: "", url: "" });

      try {
        // Step 1: Initialize upload
        const initRes = await fetch("/api/admin/audio-upload/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size
          }),
          signal: abortRef.current.signal
        });

        if (!initRes.ok) {
          const payload = await initRes.json().catch(() => ({}));
          throw new Error(payload?.error ?? "Không thể bắt đầu upload.");
        }

        const { uploadId, totalChunks } = await initRes.json();

        // Step 2: Upload chunks sequentially
        for (let i = 0; i < totalChunks; i++) {
          if (abortRef.current.signal.aborted) {
            throw new Error("Upload đã bị hủy.");
          }

          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append("uploadId", uploadId);
          formData.append("chunkIndex", String(i));
          formData.append("chunk", chunk, `${file.name}.part${i}`);

          const chunkRes = await fetch("/api/admin/audio-upload/chunk", {
            method: "POST",
            body: formData,
            signal: abortRef.current.signal
          });

          if (!chunkRes.ok) {
            const payload = await chunkRes.json().catch(() => ({}));
            throw new Error(payload?.error ?? `Lỗi upload chunk ${i + 1}/${totalChunks}.`);
          }

          const result = await chunkRes.json();
          const progress = Math.round(((i + 1) / totalChunks) * 100);

          setState((prev) => ({ ...prev, progress }));
          options.onProgress?.(progress);

          if (result.completed && result.url) {
            setState({ uploading: false, progress: 100, error: "", url: result.url });
            options.onComplete?.(result.url);
            return result.url;
          }
        }

        throw new Error("Upload hoàn tất nhưng không nhận được URL.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload thất bại.";
        setState((prev) => ({ ...prev, uploading: false, error: message }));
        options.onError?.(message);
        return null;
      }
    },
    [options]
  );

  const cancel = useCallback(async () => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, uploading: false }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ uploading: false, progress: 0, error: "", url: "" });
  }, []);

  return { ...state, upload, cancel, reset };
}
