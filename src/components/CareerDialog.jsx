import { useEffect, useRef, useState } from 'react';
import { useHub } from '../HubContext';
import { saveCareerEntry } from '../career';
import { normalizeHttpsLink } from '../links';
import { Modal, ErrorText } from './UI';

const emptyEntry = { id: null, title: '', role: '', contribution: '', link: '' };

function CareerEntry({ item, onEdit, disabled }) {
  let link = '';
  try {
    link = normalizeHttpsLink(item.link);
  } catch {
    /* Keep legacy entries readable even if their URL is invalid. */
  }
  return (
    <article aria-label={item.title} className="rounded-2xl bg-canvas/75 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[12px] font-semibold text-muted">본인 작성</span>
          <h3 className="mb-1 mt-2 break-words text-base font-semibold leading-relaxed text-ink">
            {item.title}
          </h3>
          <p className="m-0 break-words text-sm text-brand">{item.role}</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(item)}
          aria-label={`${item.title} 수정`}
          className="shrink-0 rounded-lg border border-solid border-line bg-white px-3 py-1.5 text-sm font-medium text-muted hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
        >
          수정
        </button>
      </div>
      {item.contribution && (
        <p className="mb-0 mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">
          {item.contribution}
        </p>
      )}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-sm font-medium text-brand hover:underline"
        >
          작품 보기 ↗
        </a>
      )}
    </article>
  );
}

export default function CareerDialog({ onClose }) {
  const { state, savePrivate, notify } = useHub();
  const [editor, setEditor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const editing = editor?.id != null;
  const editorId = editor?.id;
  const editorOpen = editor !== null;

  useEffect(() => {
    if (editorOpen) {
      editorRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      titleRef.current?.focus({ preventScroll: true });
    }
  }, [editorOpen, editorId]);

  function openEditor(item = emptyEntry) {
    if (busy) return;
    setError('');
    setEditor({
      id: item.id,
      title: item.title,
      role: item.role,
      contribution: item.contribution || '',
      link: item.link || '',
    });
  }
  function update(event) {
    const { name, value } = event.target;
    setEditor((current) => ({ ...current, [name]: value }));
  }
  async function submit(event) {
    event.preventDefault();
    if (busy || !editor) return;
    setBusy(true);
    setError('');
    try {
      await savePrivate({ career: saveCareerEntry(state.career, editor, editor.id) });
      setEditor(null);
      notify(editing ? '경력이 수정되었습니다.' : '경력이 등록되었습니다.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="내 커리어" kind="[dialog&]:max-w-[680px] activity-dialog" onClose={onClose}>
      <p className="mb-5 text-sm leading-relaxed text-muted">
        경력·작품 기록을 관리하세요. 등록한 경력은 언제든 수정할 수 있어요.
      </p>
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-sm text-muted">
          등록한 경력 <strong className="text-ink">{state.career.length}</strong>개
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => openEditor()}
          className="rounded-xl border border-solid border-brand/20 bg-brand/5 px-3 py-2 text-sm font-semibold text-brand hover:border-brand/40 hover:bg-brand/10"
        >
          ＋ 경력·작품 등록
        </button>
      </div>
      {editor && (
        <form
          ref={editorRef}
          onSubmit={submit}
          className="mt-4 rounded-2xl bg-canvas p-5"
          aria-label={editing ? '경력 수정' : '경력 등록'}
        >
          <h3 className="m-0 text-base font-semibold text-ink">
            {editing ? '경력 수정' : '새 경력 등록'}
          </h3>
          <fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0">
            <label>
              작품·경력 제목
              <input
                ref={titleRef}
                name="title"
                required
                maxLength={150}
                value={editor.title}
                onChange={update}
              />
            </label>
            <label>
              담당 역할
              <input name="role" required maxLength={100} value={editor.role} onChange={update} />
            </label>
            <label>
              기여 내용
              <textarea
                name="contribution"
                maxLength={2000}
                rows={3}
                value={editor.contribution}
                onChange={update}
              />
            </label>
            <label>
              작품 HTTPS 링크 (선택)
              <input
                name="link"
                type="url"
                maxLength={2000}
                placeholder="https://"
                value={editor.link}
                onChange={update}
              />
            </label>
            <ErrorText message={error} />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditor(null);
                  setError('');
                }}
                className="rounded-lg border border-solid border-line bg-white px-3 py-1.5 text-sm font-semibold text-muted hover:bg-[#eae6ef] hover:text-ink"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-lg border border-solid border-brand bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:border-[#6e43c5] hover:bg-[#6e43c5] hover:text-white"
              >
                {busy ? '저장 중…' : editing ? '수정 저장' : '경력 저장'}
              </button>
            </div>
          </fieldset>
        </form>
      )}
      <div className="mt-5 space-y-3">
        {state.career.map((item) => (
          <CareerEntry key={item.id} item={item} onEdit={openEditor} disabled={busy} />
        ))}
        {!state.career.length && (
          <p className="rounded-2xl bg-canvas px-5 py-8 text-center text-sm leading-relaxed text-muted">
            첫 작품과 참여 경험을 기록해 보세요.
          </p>
        )}
      </div>
    </Modal>
  );
}
