export function formatCount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    notation: value >= 10000 ? "compact" : "standard"
  }).format(value);
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "Dang cap nhat";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} gio ${minutes} phut`;
  return `${minutes} phut`;
}

export function formatStatus(status: "ONGOING" | "COMPLETED") {
  return status === "COMPLETED" ? "Hoan thanh" : "Dang cap nhat";
}
