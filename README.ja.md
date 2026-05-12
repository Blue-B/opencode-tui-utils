# opencode TUI Utils

[English](./README.md) | [한국어](./README.ko.md) | 日本語 | [中文](./README.zh.md)

<p align="center">
  <img src="docs/banner.png" alt="opencode-tui-utils" width="860">
</p>

[![npm version](https://img.shields.io/npm/v/opencode-tui-utils?style=flat-square)](https://www.npmjs.com/package/opencode-tui-utils)
[![Build](https://img.shields.io/github/actions/workflow/status/Blue-B/opencode-tui-utils/test.yml?branch=main&style=flat-square)](https://github.com/Blue-B/opencode-tui-utils/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

opencodeに欠けているエッセンシャルなTUIコマンド。一度インストールすれば、JSONを手動で編集する必要はありません。

このプロジェクトはコマンドを1つずつ追加します。各ユーティリティは、opencode TUIが既に持っているがスラッシュコマンドでアクセスできないデータを公開することを目的としています(opencode issue #10494のパターン)。

## プレビュー

<p align="center">
  <img src="docs/preview-command.png" alt="/disconnect コマンド選択" width="600">
</p>

<p align="center">
  <img src="docs/preview-result.png" alt="プロバイダー切断完了" width="600">
</p>

実際の画面ではopencodeのTUI dialogコンポーネントを使います。外部スクリプトではなく、opencodeのコマンドパレットとdialogの流れの中で動作します。

## なぜ使うのか

| 必要なこと | 得られるもの |
| --- | --- |
| 1つのプロバイダーだけ安全に削除 | TUIで選んだ認証項目だけを削除できます |
| JSONの手動編集を避ける | `~/.local/share/opencode/auth.json`を直接編集する必要がありません |
| トークンを表示しない | プロバイダー名と認証タイプだけを表示し、トークン値は出力しません |
| 小さな機能を追加しやすい | 共通ローダーとAPIラッパーで新しいユーティリティを追加しやすくしています |

## クイックスタート

opencodeのプラグインインストーラーでnpmからインストールします。

```bash
opencode plugin opencode-tui-utils
```

このコマンドはパッケージをインストールし、opencodeの設定を更新します。設定を手動で管理する場合は、`~/.config/opencode/tui.json`に次の項目があることを確認してください。

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": ["opencode-tui-utils"]
}
```

opencodeを再起動して実行します。

```text
/disconnect
```

OpenCodeの起動時ツールをTUIから有効化するには、次のコマンドを使います。

```text
/lsp-toggle
/websearch-toggle
/tool-status
```

toggleコマンドはshell profileを更新し、再起動が必要であることを通知します。新しいterminalを開いてOpenCodeを再起動すると、modelのtool一覧に反映されます。

## コマンド

### 利用可能

| コマンド | エイリアス | 説明 |
| --- | --- | --- |
| `/disconnect` | `/dc` | 接続済みプロバイダーを1つ選び、opencodeの認証ストレージから削除します。新しいセションを開くと変更が反映されます。 |
| `/lsp-toggle` | — | LSPサーバーとexperimental `lsp` tool用の環境変数を一緒に切り替えます。terminal/OpenCodeの再起動が必要です。 |
| `/websearch-toggle` | — | 次回OpenCode起動用の`websearch`環境変数を切り替えます。terminal/OpenCodeの再起動が必要です。API keyは不要です。 |
| `/plugin-list` | — | インストールされたプラグインとその有効状態を表示します。 |
| `/tool-status` | — | `websearch`、experimental `lsp`、LSPサーバーなど、起動時に決まるOpenCodeツールの状態を表示します。 |
| `/tool-env` | — | `websearch` と experimental `lsp` tool用の起動時環境変数を1つのmenuで管理します。terminal/OpenCodeの再起動が必要です。 |
| `/export-chat` | — | 現在のセッションのチャットをプロジェクトディレクトリにマークダウンとして保存します。 |
| `/session-diff` | — | 現在のセッションで変更されたファイル一覧を表示します。 |
| `/session-todos` | — | 現在のセッションのタスク一覧を表示します。 |

### アイデア・コントリビューション歓迎

TUIが既に持っているがスラッシュコマンドでアクセスできないデータを公開する候補です。気に入ったアイデアがあればIssueを立ててください。

| コマンド | 解決する問題 |
| --- | --- |
| `/provider-list` | "今何が接続されている？" — `/disconnect` の読み取り専用版 |
| `/session-info` | "このセッションに何通のメッセージがある？状態は？" |

## `/disconnect` の動作

`/disconnect` はopencodeの認証ファイルを読み、トップレベルのプロバイダーキーを一覧表示し、選択したプロバイダーだけを削除して同じファイルへ保存します。

例:

```json
{
  "github": { "type": "copilot-free" },
  "anthropic": { "type": "api-key" },
  "openai": { "type": "api-key" }
}
```

`github`を選択した場合、トップレベルの`github`キーだけが削除されます。`anthropic`や`openai`など他のプロバイダーは残ります。

> **注意:** opencodeはセション開始時に認証ファイルを読み込みます。切断後は新しいopencodeウィンドウまたはセションを開くと、更新されたプロバイダー一覧が反映されます。

出発点は [opencode issue #10494](https://github.com/anomalyco/opencode/issues/10494) で話されていたプロバイダー解除の不便さでした。

## データ保存

| データ | 場所 | 説明 |
| --- | --- | --- |
| プロバイダー認証 | `~/.local/share/opencode/auth.json` | 選択したプロバイダーキーだけを削除します |
| カスタム認証パス | `OPENCODE_AUTH_PATH=/path/to/auth.json` | 標準以外の場所を使う場合の上書きです |
| プラグインソース | npm package / opencode plugin cache | `/disconnect`は外部サービスへリクエストしません |

`/disconnect`はネットワークリクエストを送らず、トークン値をコピーしたりUIに出力したりしません。

## ツール状態メモ

`/lsp-toggle` はLSPを完全に使うために必要な2つの設定を一緒に変更します。

- `opencode.json` の `lsp: true/false`: LSPサーバー設定
- `OPENCODE_EXPERIMENTAL_LSP_TOOL=1`: experimental LLM tool設定

手動で起動する場合の同等の環境変数は次の通りです。

```bash
OPENCODE_EXPERIMENTAL_LSP_TOOL=true opencode
```

`/websearch-toggle` はOpenCode built-in `websearch` の起動フラグを管理します。OpenCode docsによるとAPI keyは不要で、Exa hosted MCP serviceへ認証なしで接続します。手動で起動する場合の同等の環境変数は次の通りです。

```bash
OPENCODE_ENABLE_EXA=1 opencode
```

`/tool-status` で現在のconfig、shell profile、live environmentの状態を確認できます。これらはskillsやユーザー設定のMCPサーバーではなく、OpenCode built-in toolsです。

`/tool-env` は2つの起動時環境変数を1つのmenuで管理したい場合のadvanced menuです。普段は `/lsp-toggle` と `/websearch-toggle` を使ってください。

## ユーティリティの追加

新しいコマンドは `src/plugins/` 配下に個別のプラグインモジュールとして追加し、`src/index.tsx`から登録します。追加したいアイデアがあれば [CONTRIBUTING.md](CONTRIBUTING.md) の Command Ideas リストを確認してください。

```text
src/
  core/
    api-wrapper.ts      opencode TUI APIの共通ラッパー
  plugins/
    disconnect.tsx      プロバイダー解除コマンド
    lsp-toggle.tsx      LSP切り替えコマンド
    websearch-toggle.tsx Web search切り替えコマンド
    tool-status.tsx     Tool statusコマンド
    your-command.tsx    新しいユーティリティの追加先
  index.tsx             公開プラグインエントリ
```

opencode TUI APIを使う場合は `createWrappedAPI(rawApi)` を通してください。opencodeのプラグインAPIが変わった場合の修正箇所を減らすためです。

## 開発

```bash
git clone https://github.com/Blue-B/opencode-tui-utils.git
cd opencode-tui-utils
npm install
npm run build
```

## コントリビューション

IssueとPRを歓迎します。新しいコマンドを追加する前に[CONTRIBUTING.md](CONTRIBUTING.md)を確認してください。小さく、目的がはっきりした変更を歓迎します。

## ライセンス

MIT
