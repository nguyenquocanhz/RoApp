/**
 * Format bytes to readable size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format download count to compact string (e.g., 12.5k+)
 */
export function formatDownloads(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M+";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k+";
  }
  return count.toString();
}

/**
 * Get display label for a platform
 */
export function getPlatformLabel(platform: "android" | "ios" | "web"): string {
  switch (platform) {
    case "android":
      return "Android (APK)";
    case "ios":
      return "iOS (IPA)";
    case "web":
      return "Mã nguồn Web";
    default:
      return platform;
  }
}

/**
 * Convert a string to a URL-friendly slug (e.g. "Rổ App" -> "ro-app")
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
