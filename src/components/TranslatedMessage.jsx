import { useEffect, useRef, useState } from 'react';
import { translateChatMessage } from '../chatTranslation';

export default function TranslatedMessage({ text, language, accountId }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const key = JSON.stringify([accountId, language, text]);
  const current = result?.key === key ? result : null;
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let active = true;
    setResult({ key, status: 'loading' });
    translateChatMessage({ text, targetLanguage: language, accountId }).then(
      (translated) => {
        if (active) setResult({ key, status: 'done', text: translated });
      },
      (error) => {
        if (active) setResult({ key, status: 'error', error: error.message });
      },
    );
    return () => {
      active = false;
    };
  }, [key, visible, attempt, text, language, accountId]);
  return (
    <div ref={ref}>
      <p>{current?.status === 'done' ? current.text : text}</p>
      {(!current || current.status === 'loading') && (
        <span className="text-[10px] text-muted" role="status">
          자동 번역 중…
        </span>
      )}
      {current?.status === 'done' && current.text !== text && (
        <details className="mt-2 pt-2">
          <summary className="cursor-pointer text-[10px] text-brand">원문 보기</summary>
          <p className="text-muted">{text}</p>
        </details>
      )}
      {current?.status === 'error' && (
        <div className="mt-2 text-[10px] leading-relaxed text-muted" role="status">
          <span>{current.error} 현재 원문을 표시하고 있어요.</span>
          <button
            type="button"
            className="ml-2 rounded border-0 bg-transparent p-0 text-[10px] text-brand underline"
            onClick={() => setAttempt((value) => value + 1)}
          >
            다시 번역
          </button>
        </div>
      )}
    </div>
  );
}
