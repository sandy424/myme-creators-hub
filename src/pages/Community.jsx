import { useEffect, useState } from 'react';
import { useHub } from '../HubContext';
import { categories } from '../api';
import { Tag, Avatar, Action, ErrorText } from '../components/UI';
import { normalizeHttpsLink } from '../links';
import { AttachmentPicker, AttachmentDownloads } from '../components/Attachments';
import { validateAttachments } from '../attachments';
import { useReadNotices } from '../useReadNotices';

const writableCategories = categories.filter(
  (category) => !['전체', '공지·운영 안내'].includes(category),
);
export function Board({ category = '전체' }) {
  const { state, navigate, requireUser } = useHub(),
    [selected, setSelected] = useState(category),
    [query, setQuery] = useState('');
  useEffect(() => setSelected(category), [category]);
  const posts = state.posts.filter(
    (p) =>
      (selected === '전체' || p.category === selected) &&
      (p.title + p.body).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <p
        className={`tracking-[1.6px] text-[#8665b5] text-[11px] font-[800]
          [.original-welcome_&]:text-[#bbb2c9]
          [.original-welcome_&]:tracking-[1.7px]
          [.original-welcome_&]:m-[0_0_20px]
          [.original-welcome_&]:text-[10px]
          max-[650px]:[.original-welcome_&]:tracking-[1px]
          max-[650px]:[.original-welcome_&]:text-[9px] eyebrow`}
      >
        COMMUNITY
      </p>
      <h1
        className={'tracking-[-1px] m-[15px_0_6px] text-[31px] max-[760px]:text-[27px] page-title'}
      >
        함께 나누는 크리에이터 이야기
      </h1>
      <p className={'text-muted mt-[0] text-[13px] intro'}>
        궁금한 점을 묻고, 개발 경험과 작품을 공유해 보세요.
      </p>
      <div
        className={
          'justify-between items-center gap-[10px] m-[25px_0] flex max-[760px]:flex-wrap toolbar'
        }
      >
        <div
          className={`relative
          max-[760px]:w-full
          max-[650px]:min-w-0 [&_input]:min-w-67.5
          max-[760px]:[&_input]:min-w-0
          max-[650px]:[&_input]:w-full search`}
        >
          <input
            aria-label="게시물 검색"
            placeholder="제목이나 내용으로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Action
          primary
          onClick={() => requireUser(() => navigate('#write/' + encodeURIComponent(selected)))}
        >
          ＋ 새 글 작성
        </Action>
      </div>
      <div
        className={`flex-wrap gap-[7px] m-[18px_0] flex [&_button]:bg-white [&_button]:rounded-[20px]
          [&_button]:p-[7px_15px] [&_button]:text-[12px] tabs`}
      >
        {categories.map((c) => (
          <button
            key={c}
            className={
              c === selected
                ? `[nav_a&]:text-white [nav_a&]:[background:linear-gradient(135deg,#8b5ad1,#743ac8)]
          [nav_a&]:shadow-[0_4px_14px_#8b5ad135]
          [.tabs_button&]:text-[#743ac8]
          [.tabs_button&]:[background:#f6f6f7]
          [.tabs_button&]:[border-color:#e2e1e4] [header_nav_a&]:[background:#29252f]
          [header_nav_a&]:shadow-[0_4px_12px_#25232918] active`
                : ''
            }
            onClick={() => setSelected(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {posts.map((p) => (
        <a
          className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] cursor-pointer bg-white
          rounded-[22px] mb-3 p-[21px_23px] [transition:transform_.15s,border-color_.15s] block
          shadow-[0_3px_10px_#1a0f2a04] hover:[border-color:#ccb6eb] hover:[transform:translateY(-2px)]
          hover:shadow-[0_7px_20px_#8b5ad10a] [&_h3]:m-[9px_0_5px] [&_h3]:text-[16px] [&_p]:text-muted
          [&_p]:m-[0_0_14px] [&_p]:text-[12px] post`}
          href={'#post/' + p.id}
          key={p.id}
        >
          <Tag category={p.category} />
          <h3>{p.title}</h3>
          <p>
            {p.body.slice(0, 80)}
            {p.body.length > 80 ? '…' : ''}
          </p>
          <div
            className={
              'text-[#948ba0] justify-between gap-[10px] text-[10px] flex max-[760px]:text-[9px] postmeta'
            }
          >
            <span>{p.author} · 회원 공유</span>
            <span>
              ♡ {p.likes}　◯ {p.comments.reduce((n, c) => n + 1 + c.replies.length, 0)}
            </span>
          </div>
        </a>
      ))}
      {!posts.length && (
        <div
          className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px]
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] text-center text-muted p-[35px]
          [.original-columns_&]:text-[#9c93a9]
          [.original-columns_&]:[background:#fbfbfb]
          [.original-columns_&]:[border-width:1px]
          [.original-columns_&]:[border-style:dashed]
          [.original-columns_&]:[border-color:#e9e8eb]
          [.original-columns_&]:rounded-[13px]
          [.original-columns_&]:m-[0_0_18px]
          [.original-columns_&]:p-[42px_12px]
          [.original-columns_&]:text-[12px]
          [.original-columns_&]:leading-[1.9] panel empty`}
        >
          조건에 맞는 글이 없습니다.
        </div>
      )}
    </>
  );
}
export function WritePost({ category = '전체' }) {
  const { action, navigate } = useHub(),
    [busy, setBusy] = useState(false),
    [attachments, setAttachments] = useState([]),
    [readingFiles, setReadingFiles] = useState(false),
    [error, setError] = useState('');
  const initialCategory = writableCategories.includes(category) ? category : writableCategories[0];
  const boardRoute = categories.includes(category)
    ? '#board/' + encodeURIComponent(category)
    : '#board';
  async function submit(e) {
    e.preventDefault();
    if (busy || readingFiles) return;
    const payload = Object.fromEntries(new FormData(e.currentTarget));
    setError('');
    setBusy(true);
    try {
      payload.relatedUrl = normalizeHttpsLink(payload.relatedUrl);
      payload.attachments = validateAttachments(attachments);
      const result = await action('publish-post', payload);
      navigate('#post/' + result.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className={`max-w-212.5 m-auto [&_h1]:m-[14px_0] [&_h1]:text-[29px] [&_h1]:leading-[1.4]
          max-[760px]:[&_h1]:text-[24px] article`}
    >
      <div className={'text-muted m-[15px_0_25px] text-[12px] breadcrumb'}>
        <a href={boardRoute}>커뮤니티</a> / 새 글 작성
      </div>
      <form
        className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] panel`}
        onSubmit={submit}
      >
        <h1>어떤 이야기를 나누고 싶나요?</h1>
        <label>
          게시판
          <select name="category" defaultValue={initialCategory} className="mt-2">
            {writableCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          제목
          <input name="title" required maxLength={150} placeholder="제목을 적어 주세요" />
        </label>
        <label>
          본문
          <textarea
            name="body"
            required
            rows={10}
            maxLength={20000}
            placeholder="개발 경험, 질문, 작품 이야기를 자유롭게 나눠 주세요."
          />
        </label>
        <label htmlFor="post-related-url">관련 HTTPS 링크 (선택)</label>
        <input
          id="post-related-url"
          name="relatedUrl"
          type="url"
          maxLength={2000}
          placeholder="https://"
          aria-describedby="post-related-url-help"
          className="mt-1.5"
        />
        <p id="post-related-url-help" className="mt-2 text-xs leading-relaxed text-muted">
          공유할 파일·자료·작품의 HTTPS 주소를 입력해 주세요.
        </p>
        <AttachmentPicker
          files={attachments}
          onChange={setAttachments}
          disabled={busy}
          onReadingChange={setReadingFiles}
        />
        <p
          className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
        >
          등록한 글은 다른 로그인 회원에게 공개됩니다.
        </p>
        <ErrorText message={error} />
        <div className="mt-6 flex items-center justify-end gap-3 pt-5">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-xl border border-solid border-line bg-canvas px-5 py-2.5 text-sm font-semibold text-ink hover:border-[#cbc4d6] hover:bg-[#eae6ef] hover:text-ink disabled:cursor-wait"
            onClick={() => navigate(boardRoute)}
            disabled={busy || readingFiles}
          >
            취소
          </button>
          <button
            type="submit"
            className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-xl border border-solid border-brand bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:border-[#6e43c5] hover:bg-[#6e43c5] hover:text-white disabled:cursor-wait"
            disabled={busy || readingFiles}
          >
            {busy ? '등록 중…' : readingFiles ? '파일 준비 중…' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
function ReplyForm({ postId, target, onDone }) {
  const { action } = useHub(),
    [text, setText] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await action('comment', { postId, parentId: target?.id || null, text });
      setText('');
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className={
        target
          ? `m-[12px_0_0_30px] [&_button]:mt-2
          [.comment_>_&]:[background:#fafafa]
          [.comment_>_&]:[border-width:1px]
          [.comment_>_&]:[border-style:solid]
          [.comment_>_&]:[border-color:#e9e7eb]
          [.comment_>_&]:rounded-[10px]
          [.comment_>_&]:m-[10px_0_16px]
          [.comment_>_&]:p-3.5
          [.reply_>_&]:[background:#fafafa]
          [.reply_>_&]:[border-width:1px]
          [.reply_>_&]:[border-style:solid]
          [.reply_>_&]:[border-color:#e9e7eb]
          [.reply_>_&]:rounded-[10px]
          [.reply_>_&]:m-[10px_0_16px]
          [.reply_>_&]:p-3.5 [&[hidden]]:hidden [&_label]:m-[0] [&_label]:text-[12px] [&_textarea]:mt-2
          replyform`
          : 'comment-form'
      }
      onSubmit={submit}
    >
      <label>
        {target ? target.name + '님에게 답글' : '댓글 남기기'}
        <textarea
          required
          maxLength={3000}
          rows={target ? 2 : 3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="서로 존중하는 말로 의견을 나눠 주세요."
        />
      </label>
      <ErrorText message={error} />
      <div
        className={`justify-end gap-2 flex
          max-[600px]:flex-wrap [&_button]:p-[8px_13px] [&_button]:text-[12px]
          [.replyform_&_button]:mt-[8px] reply-actions`}
      >
        <button
          type="submit"
          className={`bg-brand text-white mt-[8px] [border-color:var(--color-brand)] shadow-[0_4px_12px_#8b5ad11c] hover:text-white
          hover:[background:#7942c7]
          [.original-columns_&]:text-[#8463b4]
          [.original-columns_&]:[background:#f3f3f4]
          [.original-columns_&]:[border-color:#ebeaec]
          [.original-columns_&]:rounded-[12px]
          [.original-columns_&]:p-[9px_15px]
          [.original-columns_&]:text-[11px]
          [.original-programs_&]:rounded-[12px]
          [.original-programs_&]:text-[12px]
          [.team-welcome_&]:rounded-[12px]
          [.team-welcome_&]:p-[10px_15px]
          [.team-welcome_&]:text-[12px]
          [.public-profile-actions_&]:flex-1
          [.original-welcome_button&]:text-white
          [.original-welcome_button&]:bg-brand
          [.original-welcome_button&]:[border-color:#0000]
          [.original-welcome_button&]:shadow-[0_5px_12px_#9467d420]
          [.original-welcome_button&:hover]:text-white
          [.original-welcome_button&:hover]:[background:#6e43c5]
          [.original-programs_>_&]:text-[#77698b]
          [.original-programs_>_&]:whitespace-nowrap
          [.original-programs_>_&]:bg-white
          [.original-programs_>_&]:[border-width:1px]
          [.original-programs_>_&]:[border-style:solid]
          [.original-programs_>_&]:[border-color:#dad1e7]
          [.original-programs_>_&]:p-[11px_17px]
          max-[650px]:[.original-programs_>_&]:w-full primary`}
          disabled={busy}
        >
          {target ? '답글 등록' : '댓글 등록'}
        </button>
        {target && <Action onClick={onDone}>취소</Action>}
      </div>
    </form>
  );
}
function Comment({ comment, postId, nested = false }) {
  const [replying, setReplying] = useState(false);
  return (
    <div
      className={
        nested
          ? `[background:#f9f9fa] rounded-[10px] m-[15px_0_0_32px] p-[14px_18px]
          [.comment_>_&]:[border-left-width:3px]
          [.comment_>_&]:[border-left-style:solid]
          [.comment_>_&]:[border-left-color:#e2e1e4]
          max-[600px]:[.comment_>_&]:ml-3.5
          max-[600px]:[.comment_>_&]:p-3 [&_p]:whitespace-pre-wrap [&_p]:[overflow-wrap:anywhere] reply`
          : `[border-top-width:1px] [border-top-style:solid] [border-top-color:var(--color-line)] p-[20px_0]
          [&_p]:m-[9px_0] [&_p]:text-[13px] comment`
      }
    >
      <strong>{comment.name}</strong>
      <p>
        {comment.replyToName && (
          <span className={'text-[#8b5ad1] font-[650] reply-mention'}>@{comment.replyToName} </span>
        )}
        {comment.text}
      </p>
      <button
        type="button"
        className={`text-[#743ac8] [background:#f6f6f7] [border-width:1px] [border-style:solid] [border-color:#e2e1e4]
          rounded-[7px] items-center m-[3px_0_8px] p-[5px_10px] text-[11px] font-[700] inline-flex
          hover:text-[#5f30a3] hover:[background:#efeef1] [&[aria-expanded='true']]:text-[#5f30a3]
          [&[aria-expanded='true']]:[background:#efeef1] reply-button`}
        aria-expanded={replying}
        onClick={() => setReplying((v) => !v)}
      >
        ↳ 답글 달기
      </button>
      {replying && <ReplyForm postId={postId} target={comment} onDone={() => setReplying(false)} />}{' '}
      {!nested &&
        comment.replies.map((r) => <Comment key={r.id} comment={r} postId={postId} nested />)}
    </div>
  );
}
export function PostDetail({ id }) {
  const { state, action, notify } = useHub();
  const p = state.posts.find((p) => p.id === Number(id));
  useReadNotices(
    state.notices
      .filter((notice) => !notice.read && notice.route === '#post/' + Number(id))
      .map((notice) => notice.id),
  );
  let relatedUrl = '';
  try {
    relatedUrl = normalizeHttpsLink(p?.relatedUrl);
  } catch {
    // Older or external posts may contain unsupported URLs.
  }
  if (!p)
    return (
      <div
        className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px]
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] text-center text-muted p-[35px]
          [.original-columns_&]:text-[#9c93a9]
          [.original-columns_&]:[background:#fbfbfb]
          [.original-columns_&]:[border-width:1px]
          [.original-columns_&]:[border-style:dashed]
          [.original-columns_&]:[border-color:#e9e8eb]
          [.original-columns_&]:rounded-[13px]
          [.original-columns_&]:m-[0_0_18px]
          [.original-columns_&]:p-[42px_12px]
          [.original-columns_&]:text-[12px]
          [.original-columns_&]:leading-[1.9] panel empty`}
      >
        게시물을 찾을 수 없습니다. <a href="#board">목록으로</a>
      </div>
    );
  return (
    <div
      className={`max-w-212.5 m-auto [&_h1]:m-[14px_0] [&_h1]:text-[29px] [&_h1]:leading-[1.4]
          max-[760px]:[&_h1]:text-[24px] article`}
    >
      <div className={'text-muted m-[15px_0_25px] text-[12px] breadcrumb'}>
        <a href="#board">커뮤니티</a> / {p.category}
      </div>
      <article
        className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] panel`}
      >
        <Tag category={p.category} />
        <h1>{p.title}</h1>
        <div className={'items-center gap-[11px] flex row'}>
          <Avatar user={{ name: p.author }} />
          <div>
            <strong>{p.author}</strong>
            <div
              className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
            >
              로그인 회원에게 공유된 게시글
            </div>
          </div>
        </div>
        <div className={'whitespace-pre-wrap p-[30px_0] text-[15px] leading-[2] articlebody'}>
          {p.body}
        </div>
        <AttachmentDownloads files={p.attachments} />
        {relatedUrl && (
          <a
            href={relatedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 flex items-center gap-3 rounded-xl border border-solid border-line bg-canvas p-4 text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <svg
              className="h-5 w-5 shrink-0 text-brand"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0"
                transform="translate(2 1)"
              />
            </svg>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm">관련 파일·자료 보기</strong>
              <span className="mt-1 block break-all text-xs text-muted">{relatedUrl}</span>
            </span>
            <span className="shrink-0 text-brand" aria-hidden="true">
              ↗
            </span>
            <span className="sr-only">새 탭에서 열기</span>
          </a>
        )}
        <div
          className={`justify-between items-center gap-3 mb-[15px] flex [&_h2]:tracking-[-.6px] [&_h2]:m-[0]
          [&_h2]:text-[21px]
          max-[760px]:[&_h2]:text-[19px] [&_small]:text-muted [&_small]:text-[12px]
          [.project-workspaces_&]:items-center
          max-[760px]:[.project-workspaces_&]:flex-wrap
          max-[760px]:[.project-workspaces_&]:items-start
          [.original-columns_&_h2]:m-[0]
          [.original-columns_&_h2]:text-[17px]
          [.original-columns_&]:mb-5 sectionhead`}
        >
          <Action
            primary={p.liked}
            onClick={() =>
              action('like', { postId: p.id, liked: !p.liked }).catch((err) => notify(err.message))
            }
          >
            {p.liked ? '♥' : '♡'} 좋아요 {p.likes}
          </Action>
          <Action
            onClick={() =>
              navigator.clipboard
                .writeText(location.href)
                .then(() => notify('주소를 복사했습니다.'))
                .catch(() => notify(location.href))
            }
          >
            링크 복사
          </Action>
        </div>
      </article>
      <section
        className={`mt-5 [border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] panel`}
      >
        <h3>댓글 {p.comments.reduce((n, c) => n + 1 + c.replies.length, 0)}</h3>
        {p.comments.map((c) => (
          <Comment key={c.id} postId={p.id} comment={c} />
        ))}
        {!p.comments.length && (
          <p
            className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
          >
            첫 댓글로 이야기를 시작해 보세요.
          </p>
        )}
        <ReplyForm postId={p.id} />
      </section>
      <p>
        <a
          className={`text-[#8b7e9e] [background:0_0] [border-width:0] [border-style:none] [border-color:currentColor] p-1
          text-[12px] textlink`}
          href="#board"
        >
          ← 게시판 목록으로
        </a>
      </p>
    </div>
  );
}
