/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createWrappedAPI } from "../core/api-wrapper"

interface BookmarkedSession {
  id: string
  title: string
  addedAt: number
}

const BOOKMARKS_KEY = "opencode-tui-utils:bookmarks"

/**
 * 북마크된 세션 불러오기
 */
async function loadBookmarks(kv: ReturnType<typeof createWrappedAPI>["kv"]) {
  const bookmarks = await kv.getJSON<BookmarkedSession[]>(BOOKMARKS_KEY)
  return bookmarks || []
}

/**
 * 북마크 저장하기
 */
async function saveBookmarks(
  kv: ReturnType<typeof createWrappedAPI>["kv"],
  bookmarks: BookmarkedSession[]
) {
  await kv.setJSON(BOOKMARKS_KEY, bookmarks)
}

/**
 * 북마크 추가
 */
async function addBookmark(
  kv: ReturnType<typeof createWrappedAPI>["kv"],
  sessionId: string,
  title: string
) {
  const bookmarks = await loadBookmarks(kv)
  
  // 이미 존재하는지 확인
  if (bookmarks.some(b => b.id === sessionId)) {
    return false
  }
  
  bookmarks.push({
    id: sessionId,
    title,
    addedAt: Date.now(),
  })
  
  await saveBookmarks(kv, bookmarks)
  return true
}

/**
 * 북마크 제거
 */
async function removeBookmark(
  kv: ReturnType<typeof createWrappedAPI>["kv"],
  sessionId: string
) {
  const bookmarks = await loadBookmarks(kv)
  const filtered = bookmarks.filter(b => b.id !== sessionId)
  await saveBookmarks(kv, filtered)
  return bookmarks.length !== filtered.length
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.bookmarks",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)
    const { DialogSelect, DialogAlert } = api.ui

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.bookmarks.view",
          title: "View Bookmarked Sessions",
          category: "Session",
          namespace: "palette",
          slashName: "faves",
          slashAliases: ["fav", "bookmarks"],
          async run() {
            const bookmarks = await loadBookmarks(api.kv)

            if (bookmarks.length === 0) {
              api.ui.dialog.replace(() => (
                <DialogAlert
                  title="No Bookmarks"
                  message="You haven't bookmarked any sessions yet."
                />
              ))
              return
            }

            const options = bookmarks.map(session => ({
              title: `${session.title} (${session.id.slice(0, 8)}...)`,
              value: session.id,
              description: new Date(session.addedAt).toLocaleDateString(),
            }))

            api.ui.dialog.replace(() => (
              <DialogSelect
                title="Your Bookmarked Sessions"
                description="Select a session or press [d] to remove bookmark"
                options={options}
                onSelect={(option) => {
                  if (!option) return
                  // TODO: 나중에 세션 시작 기능 추가
                  api.ui.toast({
                    title: "Session Info",
                    message: `ID: ${option.value}`,
                  })
                }}
              />
            ))
          },
        },
        {
          name: "opencode-tui-utils.bookmarks.add",
          title: "Bookmark Current Session",
          category: "Session",
          namespace: "palette",
          slashName: "fave-add",
          async run() {
            // TODO: 현재 세션 정보 가져오기
            api.ui.toast({
              title: "Coming Soon",
              message: "Session bookmarking will be available in next version",
            })
          },
        },
      ],
    })
  },
}

export default plugin
