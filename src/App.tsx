import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { QuickCapture } from './components/QuickCapture'
import { useAppData } from './app/useAppData'
import { createNote } from './features/notes/service'
import type { NoteDraft } from './lib/types'
import { HomePage } from './pages/HomePage'
import { NoteDetailPage } from './pages/NoteDetailPage'
import { ReviewPage } from './pages/ReviewPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  const { notes, allTags, loading } = useAppData()
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setQuickCaptureOpen(true)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function handleQuickSubmit(draft: NoteDraft) {
    await createNote(draft)
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
          <h1 className="text-lg font-bold tracking-tight">学习心得整理工具</h1>
          <nav className="ml-auto flex items-center gap-2 text-sm">
            <Link
              to="/"
              className={`rounded px-3 py-1.5 ${location.pathname === '/' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              笔记
            </Link>
            <Link
              to="/review"
              className={`rounded px-3 py-1.5 ${location.pathname === '/review' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              复习
            </Link>
            <Link
              to="/settings"
              className={`rounded px-3 py-1.5 ${location.pathname === '/settings' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              设置
            </Link>
            <button
              className="rounded bg-slate-900 px-3 py-1.5 font-medium text-white"
              onClick={() => setQuickCaptureOpen(true)}
            >
              快速录入
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 md:p-6">
        {loading ? <p className="rounded bg-white p-4 text-sm text-slate-600">数据加载中...</p> : null}
        {!loading ? (
          <Routes>
            <Route path="/" element={<HomePage notes={notes} allTags={allTags} />} />
            <Route path="/note/:noteId" element={<NoteDetailPage notes={notes} allTags={allTags} />} />
            <Route path="/review" element={<ReviewPage notes={notes} />} />
            <Route path="/settings" element={<SettingsPage notes={notes} />} />
          </Routes>
        ) : null}
      </main>

      <QuickCapture
        open={quickCaptureOpen}
        allTags={allTags}
        onClose={() => setQuickCaptureOpen(false)}
        onSubmit={handleQuickSubmit}
      />
    </div>
  )
}

export default App
