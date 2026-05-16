const COUNT_PLACEHOLDER = /\{\{count\}\}/g;

export function applyCountToMessage(template: string, count: string): string {
  return template.replace(COUNT_PLACEHOLDER, count);
}

export function isRichTextContent(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function toEditorHtml(value: string): string {
  if (!value) return "";
  if (isRichTextContent(value)) return value;
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
