import { useState } from 'react';
import { useHub } from '../HubContext';
import { Modal, ErrorText } from './UI';

export default function NoticesDialog({ onClose, onOpen }) {
  const { state, markNoticesRead } = useHub();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const unread = state.notices.filter((notice) => !notice.read);

  async function read(ids, notice) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await markNoticesRead(ids);
      if (notice) onOpen(notice);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="알림" onClose={onClose}>
      <div className="my-4 flex items-center justify-between gap-3">
        <p className="m-0 text-xs text-muted" role="status">
          읽지 않은 알림 <strong className="text-brand">{unread.length}</strong>개
        </p>
        <button
          type="button"
          disabled={busy || !unread.length}
          onClick={() => read(unread.map((notice) => notice.id))}
          className="rounded-lg border border-solid border-line bg-canvas px-3 py-2 text-xs text-ink hover:bg-brand/10 hover:text-brand"
        >
          모두 읽음
        </button>
      </div>
      <ErrorText message={error} />
      <div className="max-h-[55dvh] space-y-2 overflow-y-auto">
        {state.notices.map((notice) => (
          <button
            type="button"
            key={notice.id}
            disabled={busy}
            onClick={() => read(notice.read ? [] : [notice.id], notice)}
            className={`flex w-full items-start gap-3 rounded-xl border border-solid p-4 text-left transition-colors hover:border-brand/40 hover:text-ink ${notice.read ? 'border-line bg-white' : 'border-brand/15 bg-brand/5'}`}
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notice.read ? 'bg-transparent' : 'bg-brand'}`}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span
                className={`block text-xs leading-relaxed text-ink ${notice.read ? 'font-normal' : 'font-semibold'}`}
              >
                {notice.text}
              </span>
              <span className="mt-1 block break-words text-[11px] leading-relaxed text-muted">
                {notice.sub}
              </span>
              <span className="sr-only">{notice.read ? '읽음' : '읽지 않음'}</span>
            </span>
          </button>
        ))}
        {!state.notices.length && (
          <p className="py-10 text-center text-sm text-muted">새 알림이 없습니다.</p>
        )}
      </div>
    </Modal>
  );
}
