/**
 * OpenCode TUI API Wrapper
 * 
 * API 변경에 대비한 래퍼 레이어
 * - opencode 버전 업데이트 시 여기만 수정하면 됨
 * - 모든 플러그인이 자동으로 호환성 유지
 */

import type { TuiPluginApi } from "@opencode-ai/plugin/tui"

export interface WrappedAPI {
  keymap: ReturnType<typeof createKeymapAPI>
  ui: ReturnType<typeof createUIAPI>
  kv: ReturnType<typeof createKVAPI>
}

/**
 * Keymap API 래퍼
 * /disconnect, /faves 같은 명령어 등록
 */
export function createKeymapAPI(api: TuiPluginApi) {
  return {
    registerLayer: (config: Parameters<typeof api.keymap.registerLayer>[0]) => {
      return api.keymap.registerLayer(config)
    },
  }
}

/**
 * UI API 래퍼
 * DialogSelect, DialogAlert, Toast 등
 */
export function createUIAPI(api: TuiPluginApi) {
  return {
    dialog: {
      replace: (component: Parameters<typeof api.ui.dialog.replace>[0]) => {
        return api.ui.dialog.replace(component)
      },
      clear: () => {
        return api.ui.dialog.clear()
      },
    },
    toast: (options: Parameters<typeof api.ui.toast>[0]) => {
      return api.ui.toast(options)
    },
    // DialogSelect, DialogAlert는 직접 api.ui에서 가져옴 (재내보내기)
    DialogSelect: api.ui.DialogSelect,
    DialogAlert: api.ui.DialogAlert,
  }
}

/**
 * KV Storage API 래퍼
 * 세션 북마크 저장/로드용
 */
export function createKVAPI(api: TuiPluginApi) {
  return {
    get: async (key: string): Promise<string | undefined> => {
      try {
        return await api.kv.get(key)
      } catch (error) {
        console.error(`Failed to get KV key "${key}":`, error)
        return undefined
      }
    },
    set: async (key: string, value: string): Promise<void> => {
      try {
        await api.kv.set(key, value)
      } catch (error) {
        console.error(`Failed to set KV key "${key}":`, error)
      }
    },
    delete: async (key: string): Promise<void> => {
      try {
        await api.kv.delete(key)
      } catch (error) {
        console.error(`Failed to delete KV key "${key}":`, error)
      }
    },
    getJSON: async <T = unknown>(key: string): Promise<T | undefined> => {
      try {
        const value = await api.kv.get(key)
        return value ? JSON.parse(value) : undefined
      } catch (error) {
        console.error(`Failed to parse JSON from KV key "${key}":`, error)
        return undefined
      }
    },
    setJSON: async <T = unknown>(key: string, value: T): Promise<void> => {
      try {
        await api.kv.set(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Failed to set JSON to KV key "${key}":`, error)
      }
    },
  }
}

/**
 * 메인 래퍼 함수
 * 모든 플러그인에서 사용
 */
export function createWrappedAPI(api: TuiPluginApi): WrappedAPI {
  return {
    keymap: createKeymapAPI(api),
    ui: createUIAPI(api),
    kv: createKVAPI(api),
  }
}
