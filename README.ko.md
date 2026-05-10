# opencode TUI Utils

[English](./README.md) | 한국어 | [日本語](./README.ja.md) | [中文](./README.zh.md)

<p align="center">
  <img src="docs/banner.png" alt="opencode-tui-utils" width="860">
</p>

[![npm version](https://img.shields.io/npm/v/opencode-tui-utils?style=flat-square)](https://www.npmjs.com/package/opencode-tui-utils)
[![Build](https://img.shields.io/github/actions/workflow/status/Blue-B/opencode-tui-utils/test.yml?branch=main&style=flat-square)](https://github.com/Blue-B/opencode-tui-utils/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[opencode](https://opencode.ai) TUI에서 자주 필요한 작업을 작은 명령어로 추가하는 플러그인 패키지입니다. 첫 기능은 연결된 프로바이더를 안전하게 해제하는 `/disconnect` 명령입니다.

이 프로젝트는 명령어를 하나씩 확장할 수 있도록 구성되어 있습니다. 각 유틸리티는 opencode TUI 안에서 한 가지 문제를 명확하게 해결하고, 검토와 테스트가 쉬운 형태를 유지하는 것을 기준으로 합니다.

## 미리보기

<p align="center">
  <img src="docs/preview-command.png" alt="/disconnect 명령 선택" width="600">
</p>

<p align="center">
  <img src="docs/preview-result.png" alt="프로바이더 해제 완료" width="600">
</p>

실제 화면은 opencode의 TUI dialog 컴포넌트를 사용합니다. 별도 스크립트를 실행하는 방식이 아니라 opencode 안의 명령 팔레트와 dialog 흐름에서 자연스럽게 동작합니다.

## 왜 필요한가요?

| 필요 | 제공 가치 |
| --- | --- |
| 프로바이더 하나만 안전하게 제거 | TUI에서 선택한 인증 항목 하나만 삭제합니다 |
| 직접 JSON 수정 방지 | `~/.local/share/opencode/auth.json`을 손으로 열어 수정하지 않아도 됩니다 |
| 토큰 노출 방지 | 프로바이더 이름과 인증 타입만 표시하고 토큰 값은 출력하지 않습니다 |
| 기능 확장 | 공용 플러그인 로더와 API 래퍼로 새 유틸리티를 추가하기 쉽습니다 |

## 시작하기

opencode의 플러그인 설치 명령으로 npm에서 설치합니다.

```bash
opencode plugin opencode-tui-utils
```

이 명령은 패키지를 설치하고 opencode 설정을 갱신합니다. 직접 설정을 관리한다면 `~/.config/opencode/tui.json`에 아래 항목이 있어야 합니다.

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": ["opencode-tui-utils"]
}
```

opencode를 재시작한 뒤 실행합니다.

```text
/disconnect
```

## 명령어

| 명령어 | 별칭 | 설명 |
| --- | --- | --- |
| `/disconnect` | `/dc` | 연결된 프로바이더 중 하나를 선택해 opencode 인증 저장소에서 제거합니다. 새 세션을 열어야 변경 사항이 반영됩니다. |
| `/lsp-toggle` | — | `~/.config/opencode/opencode.json`의 `lsp` 설정을 true/false로 전환합니다. opencode 재시작 필요. |

## `/disconnect` 동작 방식

`/disconnect`는 opencode 인증 파일을 읽고, 최상위 프로바이더 키 목록을 보여준 뒤, 사용자가 선택한 프로바이더 하나만 제거한 상태로 같은 파일을 다시 저장합니다.

예시 인증 구조:

```json
{
  "github": { "type": "copilot-free" },
  "anthropic": { "type": "api-key" },
  "openai": { "type": "api-key" }
}
```

여기서 `github`를 선택하면 최상위 `github` 키만 제거됩니다. `anthropic`, `openai` 같은 다른 프로바이더 항목은 그대로 유지됩니다.

> **참고:** opencode는 세션 시작 시 인증 파일을 읽습니다. 해제 후에는 새로운 opencode 창이나 세션을 열어야 업데이트된 프로바이더 목록이 반영됩니다.

처음 시작점은 [opencode issue #10494](https://github.com/anomalyco/opencode/issues/10494)에서 다뤄진 프로바이더 해제 불편함이었습니다.

## 데이터 저장

| 데이터 | 위치 | 설명 |
| --- | --- | --- |
| 프로바이더 인증 | `~/.local/share/opencode/auth.json` | 선택한 프로바이더 키만 이 파일에서 제거합니다 |
| 사용자 지정 인증 경로 | `OPENCODE_AUTH_PATH=/path/to/auth.json` | 기본 위치가 아닌 경우 사용할 수 있습니다 |
| 플러그인 소스 | npm 패키지 / opencode plugin cache | `/disconnect`는 외부 서비스에 요청하지 않습니다 |

`/disconnect`는 네트워크 요청을 보내지 않고, 토큰 값을 복사하거나 UI에 출력하지 않습니다.

## 유틸리티 확장 방법

새 명령어는 `src/plugins/` 아래에 별도 플러그인 모듈로 추가하고, `src/index.tsx`에서 등록합니다.

```text
src/
  core/
    api-wrapper.ts      opencode TUI API 공용 래퍼
  plugins/
    disconnect.tsx      프로바이더 해제 명령어
    lsp-toggle.tsx      LSP 전환 명령어
    your-command.tsx    새 유틸리티 추가 위치
  index.tsx             공개 플러그인 진입점
```

최소 명령어 형태:

```typescript
/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createWrappedAPI } from "../core/api-wrapper"

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.your-command",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.your-command",
          title: "Your Command",
          category: "Utility",
          namespace: "palette",
          slashName: "your-command",
          async run() {
            api.ui.toast({ message: "Command ran successfully." })
          },
        },
      ],
    })
  },
}

export default plugin
```

그 다음 `src/index.tsx`에 등록합니다.

```typescript
import yourCommand from "./plugins/your-command"

const plugins: TuiPluginModule[] = [disconnectPlugin, lspTogglePlugin, yourCommand]
```

opencode TUI API를 사용할 때는 `createWrappedAPI(rawApi)`를 거치도록 합니다. opencode 플러그인 API가 바뀌었을 때 수정 지점을 줄이기 위한 구조입니다.

## 개발

```bash
git clone https://github.com/Blue-B/opencode-tui-utils.git
cd opencode-tui-utils
npm install
npm run build
```

로컬 소스 파일 테스트 예시:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": ["/absolute/path/to/opencode-tui-utils/src/plugins/disconnect.tsx"]
}
```

`tui.json` 변경 후에는 opencode를 재시작해야 합니다.

## 기여

이슈와 PR은 환영합니다. 새 명령어를 추가하기 전에는 [CONTRIBUTING.md](CONTRIBUTING.md)를 확인해 주세요. 작고 명확한 변경을 선호합니다.

## 라이선스

MIT
