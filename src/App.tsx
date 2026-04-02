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
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">学习心得整理工具</h1>
          <nav className="ml-auto flex items-center gap-1.5 md:gap-2">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}>
              笔记
            </Link>
            <Link to="/review" className={`nav-link ${location.pathname === '/review' ? 'nav-link-active' : ''}`}>
              复习
            </Link>
            <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'nav-link-active' : ''}`}>
              设置
            </Link>
            <button className="btn-primary" onClick={() => setQuickCaptureOpen(true)}>
              快速录入
            </button>
          </nav>
        </div>
      </header>

      <main className="main-wrap">
        {loading ? <p className="surface p-4 text-sm hint">数据加载中...</p> : null}
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
