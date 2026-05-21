export function formatCount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    notation: value >= 10000 ? "compact" : "standard"
  }).format(value);
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "Đang cập nhật";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return `${minutes} phút`;
}

export function formatSeconds(seconds: number | null | undefined) {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${hours} giờ ${minutes} phút ${remainingSeconds} giây`;
}

export function formatTimeCompact(seconds: number | null | undefined): string {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(secs)}`;
  return `${minutes}:${pad(secs)}`;
}

export function formatTimeSmart(seconds: number | null | undefined, durationSeconds?: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const shouldShowHours = (durationSeconds ?? totalSeconds) >= 3600;
  if (shouldShowHours) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${hours} giờ ${minutes} phút ${remainingSeconds} giây`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes} phút ${remainingSeconds} giây`;
}

export function formatStatus(status: "ONGOING" | "COMPLETED") {
  return status === "COMPLETED" ? "Hoàn thành" : "Đang cập nhật";
}
