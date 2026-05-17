import type { PersistableWidgetSettings } from "../utils/widgetSettings";

type WidgetSettingsResponse = {
  settings: PersistableWidgetSettings;
};

type ErrorResponse = {
  error?: string;
  details?: string;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & ErrorResponse;

  if (!response.ok) {
    throw new Error(body.error || body.details || "Request failed");
  }

  return body;
}

export async function fetchWidgetSettings(): Promise<PersistableWidgetSettings> {
  const response = await fetch("/api/widget-settings");
  const data = await parseJsonResponse<WidgetSettingsResponse>(response);
  return data.settings;
}

export async function updateWidgetSettings(
  settings: PersistableWidgetSettings,
): Promise<PersistableWidgetSettings> {
  const response = await fetch("/api/widget-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  const data = await parseJsonResponse<WidgetSettingsResponse>(response);
  return data.settings;
}
