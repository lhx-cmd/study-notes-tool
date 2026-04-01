import type { AppSettings } from '../../lib/types'

const SETTINGS_KEY = 'study-notes-settings'

const DEFAULT_SETTINGS: AppSettings = {
  glmApiKey: '',
  glmModel: 'glm-5',
}

export function getSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY)
  if (!raw) {
    return DEFAULT_SETTINGS
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      glmApiKey: parsed.glmApiKey ?? '',
      glmModel: parsed.glmModel ?? DEFAULT_SETTINGS.glmModel,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
