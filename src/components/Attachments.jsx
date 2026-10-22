import { useRef, useState } from 'react';
import {
  formatFileSize,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENT_COUNT,
  readAttachments,
  validateAttachments,
} from '../attachments';
import { ErrorText } from './UI';

function AttachmentIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m8 12 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l9-9m-1 9-5 5a1 1 0 0 1-2-2l7-7" />
    </svg>
  );
}

export function AttachmentPicker({ files, onChange, disabled, onReadingChange }) {
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const readingRef = useRef(false);
  const locked = disabled || reading;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  async function addFiles(selected) {
    if (disabled || readingRef.current || !selected.length) return;
    setError('');
    if (files.length + selected.length > MAX_ATTACHMENT_COUNT) {
      setError('첨부자료는 최대 5개까지 추가할 수 있습니다.');
      return;
    }
    if (
      totalBytes + Array.from(selected).reduce((sum, file) => sum + file.size, 0) >
      MAX_ATTACHMENT_BYTES
    ) {
      setError(
        '첨부자료의 전체 용량은 2MB 이하로 선택해 주세요. 큰 파일은 HTTPS 링크로 공유할 수 있어요.',
      );
      return;
    }
    readingRef.current = true;
    setReading(true);
    onReadingChange(true);
    try {
      onChange([...files, ...(await readAttachments(selected))]);
    } catch (err) {
      setError(err.message || '파일을 읽지 못했습니다. 다시 선택해 주세요.');
    } finally {
      readingRef.current = false;
      setReading(false);
      onReadingChange(false);
    }
  }

  return (
    <section className="mt-5" aria-labelledby="attachment-heading">
      <h2 id="attachment-heading" className="m-0 text-sm font-semibold text-ink">
        첨부자료 (선택)
      </h2>
      <div
        className={`relative mt-2 rounded-2xl border-2 border-dashed transition-colors focus-within:ring-2 focus-within:ring-brand/40 ${dragging ? 'border-brand bg-brand/10' : 'border-line bg-canvas/60 hover:border-brand/50'} ${locked ? 'pointer-events-none opacity-60' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!locked) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <input
          id="post-attachments"
          type="file"
          multiple
          disabled={locked}
          aria-label="첨부자료 선택"
          aria-describedby="attachment-help"
          className="sr-only"
          onChange={(event) => {
            addFiles(Array.from(event.target.files));
            event.target.value = '';
          }}
        />
        <label
          htmlFor="post-attachments"
          className="m-0 flex cursor-pointer flex-col items-center gap-2 px-5 py-7 text-center"
        >
          <span className="mb-1 grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
            <AttachmentIcon />
          </span>
          <span className="text-base font-semibold text-ink">
            {reading ? '파일을 준비하고 있어요…' : '파일을 끌어다 놓거나 선택해 주세요'}
          </span>
          <span className="text-sm font-normal text-muted">
            이미지, 문서, 압축파일 등 함께 나눌 자료
          </span>
          <span className="mt-2 rounded-lg border border-solid border-brand/20 bg-white px-4 py-2 text-sm font-semibold text-brand">
            파일 선택
          </span>
        </label>
      </div>
      <p id="attachment-help" className="mt-2 text-sm leading-relaxed text-muted">
        최대 5개 · 전체 2MB까지 첨부할 수 있어요. 큰 파일은 위의 HTTPS 링크로 공유해 주세요.
      </p>
      {files.length > 0 && (
        <>
          <ul className="m-0 list-none space-y-2 p-0">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-solid border-line bg-white px-3 py-2.5"
              >
                <span className="shrink-0 text-brand">
                  <AttachmentIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-[14px] text-muted">{formatFileSize(file.size)}</span>
                </span>
                <button
                  type="button"
                  disabled={locked}
                  aria-label={`${file.name} 첨부 삭제`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-0 bg-canvas p-0 text-lg text-muted hover:bg-brand/10 hover:text-brand"
                  onClick={() => {
                    onChange(files.filter((_, i) => i !== index));
                    setError('');
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-right text-[14px] text-muted" role="status">
            {files.length}개 · {formatFileSize(totalBytes)}
          </p>
        </>
      )}
      <ErrorText message={error} />
    </section>
  );
}

export function AttachmentDownloads({ files }) {
  let attachments;
  try {
    attachments = validateAttachments(files);
  } catch {
    return null;
  }
  if (!attachments.length) return null;
  return (
    <section className="mb-6" aria-label="첨부자료 다운로드">
      <h2 className="mb-3 text-base font-semibold text-ink">
        첨부자료 <span className="text-brand">{attachments.length}</span>
      </h2>
      <ul className="m-0 list-none space-y-2 p-0">
        {attachments.map((file, index) => (
          <li key={`${file.name}-${index}`}>
            <a
              href={file.dataUrl}
              download={file.name}
              className="flex items-center gap-3 rounded-xl border border-solid border-line bg-canvas p-3 text-ink transition-colors hover:border-brand hover:text-brand"
            >
              <span className="shrink-0 text-brand">
                <AttachmentIcon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block break-all text-base font-medium">{file.name}</span>
                <span className="text-sm text-muted">{formatFileSize(file.size)}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-brand">다운로드 ↓</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
