import React, { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

// Modal for creating (or selecting) a user by id.
//
// On open it fetches the suggested next sequential id (e.g. "user_3") and
// prefills the input. The user may edit it, keep it, or clear it; clearing it
// sends a blank id so the backend auto-assigns the next user_N.
export default function CreateUserModal({ open, busy, onClose, onSubmit }) {
  const [value, setValue] = useState('')
  const [placeholder, setPlaceholder] = useState('user_N (자동)')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // When the modal opens, reset state and fetch the suggested next id.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setError('')
    setValue('')
    setPlaceholder('user_N (자동)')
    api
      .getNextUserId()
      .then((res) => {
        if (cancelled) return
        const next = res?.user_id || ''
        if (next) setValue(next)
      })
      .catch(() => {
        // Defensive: leave the input empty with the auto placeholder.
      })
    // Focus the input shortly after open.
    const t = setTimeout(() => inputRef.current?.focus(), 0)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [open])

  if (!open) return null

  const submit = async () => {
    setError('')
    try {
      await onSubmit(value.trim())
    } catch {
      setError('사용자 생성에 실패했습니다. 잠시 후 다시 시도하세요.')
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!busy) submit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (!busy) onClose()
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        // Close only when the backdrop itself is clicked.
        if (e.target === e.currentTarget && !busy) onClose()
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="새 사용자 생성"
      >
        <h2 className="modal-title">새 사용자 생성</h2>
        <label className="modal-field">
          <span className="modal-label">사용자 ID</span>
          <input
            ref={inputRef}
            type="text"
            className="modal-input"
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
          />
        </label>
        <div className="modal-help muted small">
          비워두면 자동으로 user_N 순번이 부여됩니다.
        </div>
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-actions">
          <button className="btn" onClick={onClose} disabled={busy}>
            취소
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>
            생성
          </button>
        </div>
      </div>
    </div>
  )
}
