"use client";

import { useCallback, useRef, useState } from "react";
import { CHUNK_SIZE } from "@/lib/upload/constants";

type UploadState = {
  uploading: boolean;
  progress: number;
  error: string;
  url: string;
};

type UploadOptions = {
  onProgress?: (progress: number) => void;
  onComplete?: (url: string) => void;
  onError?: (error: string) => void;
};

type InitPayload = {
  uploadId: string;
  totalChunks: number;
};

type ChunkPayload = {
  completed?: boolean;
  url?: string;
};

function isJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

async function readErrorMessage(response: Response, fallback: string) {
  if (isJsonResponse(response)) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (payload?.error) return payload.error;
    return fallback;
  }

  const text = await response.text().catch(() => "");
  if (response.status === 401 || response.status === 403) {
    return "Phien dang nhap admin da het han. Vui long dang nhap lai.";
  }
  if (text.includes("<!DOCTYPE") || text.includes("<html")) {
    return "Server tra ve HTML thay vi JSON. Kiem tra auth admin va middleware.";
  }
  return fallback;
}

async function readJsonOrThrow<T>(response: Response, fallbackError: string): Promise<T> {
  if (!isJsonResponse(response)) {
    const error = await readErrorMessage(response, fallbackError);
    throw new Error(error);
  }
  const payload = (await response.json().catch(() => null)) as T | null;
  if (!payload) {
    throw new Error(fallbackError);
  }
  return payload;
}

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
          const error = await readErrorMessage(initRes, "Khong the bat dau upload.");
          throw new Error(error);
        }

        const { uploadId, totalChunks } = await readJsonOrThrow<InitPayload>(
          initRes,
          "Phan hoi init upload khong hop le."
        );

        for (let i = 0; i < totalChunks; i++) {
          if (abortRef.current.signal.aborted) {
            throw new Error("Upload da bi huy.");
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
            const error = await readErrorMessage(chunkRes, `Loi upload chunk ${i + 1}/${totalChunks}.`);
            throw new Error(error);
          }

          const result = await readJsonOrThrow<ChunkPayload>(
            chunkRes,
            `Phan hoi chunk ${i + 1}/${totalChunks} khong hop le.`
          );
          const progress = Math.round(((i + 1) / totalChunks) * 100);

          setState((prev) => ({ ...prev, progress }));
          options.onProgress?.(progress);

          if (result.completed && result.url) {
            setState({ uploading: false, progress: 100, error: "", url: result.url });
            options.onComplete?.(result.url);
            return result.url;
          }
        }

        throw new Error("Upload hoan tat nhung khong nhan duoc URL.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload that bai.";
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
