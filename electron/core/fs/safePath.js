export function safeFileName(value, fallback = "untitled") {
  const cleaned = String(value || fallback)
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase()
    .slice(0, 90);

  return cleaned || fallback;
}

export function safeProjectName() {
  const now = new Date().toISOString().replace(/[:.]/g, "-");
  return `project-${now}`;
}