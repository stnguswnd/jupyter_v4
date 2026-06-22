import React from 'react'

function truncate(id) {
  if (!id) return ''
  return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function userLabel(u) {
  const date = formatDate(u.created_at)
  const count = `(${u.thread_count ?? 0}개 대화)`
  return [truncate(u.user_id), count, date].filter(Boolean).join(' · ')
}

export default function Sidebar({
  userId,
  users = [],
  threads,
  selectedThreadId,
  busy,
  onSelectUser,
  onCreateUser,
  onDeleteUser,
  onCreateThread,
  onSelectThread,
  onDeleteThread,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h1 className="app-title">제조 설비 진단</h1>
        <div className="muted small">어시스턴트</div>
      </div>

      <div className="sidebar-section">
        <div className="section-label">사용자 선택</div>
        <select
          className="user-select"
          value={users.some((u) => u.user_id === userId) ? userId : ''}
          onChange={(e) => onSelectUser(e.target.value)}
          disabled={busy || users.length === 0}
        >
          {users.length === 0 ? (
            <option value="">사용자가 없습니다</option>
          ) : (
            <>
              {!users.some((u) => u.user_id === userId) && (
                <option value="" disabled>
                  사용자를 선택하세요
                </option>
              )}
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {userLabel(u)}
                </option>
              ))}
            </>
          )}
        </select>

        <div className="section-label">현재 사용자</div>
        {userId ? (
          <div className="user-id" title={userId}>{truncate(userId)}</div>
        ) : (
          <div className="muted small">사용자가 없습니다</div>
        )}
        <div className="btn-row">
          <button className="btn" onClick={onCreateUser} disabled={busy}>
            새 사용자 생성
          </button>
          <button
            className="btn btn-danger"
            onClick={onDeleteUser}
            disabled={busy || !userId}
          >
            사용자 삭제
          </button>
        </div>
      </div>

      <div className="sidebar-section threads">
        <div className="section-label">대화 목록</div>
        <button
          className="btn btn-sm"
          onClick={onCreateThread}
          disabled={busy || !userId}
        >
          + 새 대화
        </button>
        <ul className="thread-list">
          {threads.length === 0 && userId && (
            <li className="muted small empty">대화가 없습니다</li>
          )}
          {threads.map((t) => (
            <li
              key={t.thread_id}
              className={`thread-item ${
                t.thread_id === selectedThreadId ? 'active' : ''
              }`}
              onClick={() => onSelectThread(t.thread_id)}
            >
              <span className="thread-title">
                {t.title || `대화 ${t.thread_id.slice(0, 6)}`}
              </span>
              <button
                className="icon-btn"
                title="대화 삭제"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteThread(t.thread_id)
                }}
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
