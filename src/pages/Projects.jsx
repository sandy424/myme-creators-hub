import { useState } from 'react';
import { useHub } from '../HubContext';
import { Action, Modal, ErrorText } from '../components/UI';
const states = [
  '아이디어 구상 중',
  '팀원 모집 중',
  '프로토타입 제작 중',
  '개발 중',
  '출시 준비 중',
  '출시 완료',
];
export function Team() {
  const { user, state, navigate, open } = useHub();
  return (
    <>
      <section
        className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] mt-5 [&_h1]:m-[0_0_8px] [&_h1]:text-[23px]
          [&_h1]:font-[900] panel team-welcome`}
      >
        <h1>{user.name}님의 협력·커리어</h1>
        <p
          className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
        >
          일정과 작업은 팀이 선택한 외부 도구에서 관리합니다.
        </p>
        <div
          className={`flex-wrap gap-2.5 flex
          [.original-boards_&]:grid-cols-[repeat(auto-fit,minmax(125px,1fr))]
          [.original-boards_&]:gap-2.5
          [.original-boards_&]:mt-4.5
          [.original-boards_&]:grid
          max-[650px]:[.original-boards_&]:grid-cols-[repeat(2,minmax(0,1fr))]
          [.original-welcome_&]:gap-2 actions`}
        >
          <Action primary onClick={() => navigate('#projects')}>
            프로젝트
          </Action>
          <Action primary onClick={() => open('career')}>
            내 커리어
          </Action>
          <Action primary onClick={() => open('bounties')}>
            QA·번역 품앗이
          </Action>
        </div>
      </section>
      <div
        className={`[&_h2]:m-[0_0_12px] [&_h2]:text-[17px] grid-cols-[1.35fr_1fr] gap-5.5 mt-6.5 grid
          max-[900px]:gap-4
          max-[650px]:grid-cols-[1fr] original-columns`}
      >
        <section
          className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] panel`}
        >
          <h2>공유 프로젝트 · {state.projects.length}개</h2>
          {state.projects.map((p) => (
            <a
              className={`[border-top-width:1px] [border-top-style:solid] [border-top-color:var(--color-line)] p-[20px_0] block
          [&:hover_h3]:text-[#8b5ad1] [&_strong]:text-[#1a0f2a] [&_strong]:text-[11px] [&_h3]:m-[8px_0]
          [&_h3]:text-[15px] [&_p]:text-[#564c64] [&_p]:m-[4px_0] [&_p]:text-[12px] [&_p]:leading-[1.8]
          [&_small]:text-[#746788] [&_small]:text-[10px] original-post`}
              href={'#projects/' + p.id}
              key={p.id}
            >
              <h3>{p.title}</h3>
              <p>{p.summary.slice(0, 100)}</p>
              <small>{p.state} · 프로젝트 보기 ↗</small>
            </a>
          ))}
          {!state.projects.length && (
            <p
              className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
            >
              아직 등록된 프로젝트가 없습니다.
            </p>
          )}
        </section>
        <section
          className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] panel`}
        >
          <h2>내 커리어 · {state.career.length}건</h2>
          {state.career.map((c) => (
            <div
              className={`[border-top-width:1px] [border-top-style:solid] [border-top-color:var(--color-line)] p-[20px_0] block
          [&:hover_h3]:text-[#8b5ad1] [&_strong]:text-[#1a0f2a] [&_strong]:text-[11px] [&_h3]:m-[8px_0]
          [&_h3]:text-[15px] [&_p]:text-[#564c64] [&_p]:m-[4px_0] [&_p]:text-[12px] [&_p]:leading-[1.8]
          [&_small]:text-[#746788] [&_small]:text-[10px] original-post`}
              key={c.id}
            >
              <h3>{c.title}</h3>
              <p>{c.role} · 본인 작성</p>
            </div>
          ))}
          {!state.career.length && (
            <p
              className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
            >
              첫 경력을 등록해 보세요.
            </p>
          )}
        </section>
      </div>
      <section
        className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] panel`}
      >
        <h2>품앗이 요청</h2>
        <p
          className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
        >
          등록된 요청이 없습니다.
        </p>
      </section>
    </>
  );
}
export function Projects({ id }) {
  const { state, open, action, notify } = useHub();
  const p = state.projects.find((p) => p.id === Number(id)) || state.projects[0];
  return (
    <>
      <p className={'text-muted m-[15px_0_25px] text-[12px] breadcrumb'}>
        <a href="#team">팀협업</a> / 프로젝트
      </p>
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
        <h1
          className={
            'tracking-[-1px] m-[15px_0_6px] text-[31px] max-[760px]:text-[27px] page-title'
          }
        >
          프로젝트
        </h1>
        <Action primary onClick={() => open('project-editor')}>
          ＋ 프로젝트 추가
        </Action>
      </div>
      <p className={'text-muted mt-[0] text-[13px] intro'}>
        프로젝트를 등록하고 팀에서 사용하는 작업 공간을 연결하세요.
      </p>
      <div className={'gap-[12px] m-[24px_0] p-[4px_2px_10px] flex overflow-x-auto project-picker'}>
        {state.projects.map((p) => (
          <a
            href={'#projects/' + p.id}
            className={
              `[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[16px]
          flex-col flex-1 gap-[9px]
          min-w-57.5
          max-w-75 p-4.5 flex [&_strong]:[overflow-wrap:anywhere] [&_strong]:text-[15px] [&_small]:text-muted
          [&_small]:text-[11px] project-choice ` +
              (p.id === Number(id)
                ? `[.project-choice&]:[background:#f6f6f7]
          [.project-choice&]:[border-width:2px]
          [.project-choice&]:[border-style:solid]
          [.project-choice&]:[border-color:#a17ada]
          [.chat-contact&]:text-[#502e81]
          [.chat-contact&]:[background:#f5f4f6]
          [.chat-contact&]:[border-color:#eae9eb]
          [.auth-tabs_button&]:text-[#8b5ad1]
          [.auth-tabs_button&]:[border-bottom-color:#8b5ad1] selected`
                : '')
            }
            key={p.id}
          >
            <span
              className={`text-[#743ac8] [background:#f6f6f7] [border-width:1px] [border-style:solid] [border-color:#efeef1]
          rounded-[5px] p-[3px_8px] text-[10px] font-[700] inline-block
          [.project-choice_&]:[align-self:flex-start]
          [.original-member_&]:ml-2
          [.public-name_&]:rounded-[20px] tag`}
            >
              {p.state}
            </span>
            <strong>{p.title}</strong>
            <small>{p.summary.slice(0, 70)}</small>
          </a>
        ))}
      </div>
      {p ? (
        <section
          className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[22px] p-7
          shadow-[0_5px_24px_#3a215d03]
          max-[650px]:p-[23px] [&_h3]:m-[0] [&_h3]:text-[15px]
          [.original-columns_&]:[align-self:stretch]
          [.original-columns_&]:min-w-0
          [.cardgrid_&:hover]:[border-color:#d3c4e9] panel`}
        >
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
            <span
              className={`text-[#743ac8] [background:#f6f6f7] [border-width:1px] [border-style:solid] [border-color:#efeef1]
          rounded-[5px] p-[3px_8px] text-[10px] font-[700] inline-block
          [.project-choice_&]:[align-self:flex-start]
          [.original-member_&]:ml-2
          [.public-name_&]:rounded-[20px] tag`}
            >
              선택한 프로젝트
            </span>
            {p.canEdit ? (
              <Action onClick={() => open('project-editor', { id: p.id })}>프로젝트 수정</Action>
            ) : (
              <span
                className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
              >
                작성자만 수정할 수 있습니다.
              </span>
            )}
          </div>
          <h2>{p.title}</h2>
          <p className={'whitespace-pre-wrap text-muted mt-[0] text-[13px] intro'}>{p.summary}</p>
          <p
            className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
          >
            {p.members || '팀 구성 미입력'} · {p.state}
          </p>
          <section
            className={`[border-top-width:1px] [border-top-style:solid] [border-top-color:var(--color-line)] mt-6.5 pt-[23px]
          [&_h3]:text-[17px] project-workspaces`}
          >
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
              <div>
                <h3>팀 작업 공간</h3>
                <p
                  className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
                >
                  {p.title}에서 사용하는 도구를 한곳에 모으세요.
                </p>
              </div>
              {p.canEdit && (
                <Action primary onClick={() => open('link', { id: p.id })}>
                  ＋ 링크 추가
                </Action>
              )}
            </div>
            {p.links.map((l, i) => (
              <div
                className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] rounded-[12px]
          justify-between items-center m-[12px_0] p-[17px] flex
          max-[760px]:gap-2.5 [&_a]:text-brand [&_a]:font-[650]
          max-[760px]:[&_a]:[word-break:break-word] [&_small]:text-muted [&_small]:block
          [.project-workspaces_&]:[background:#fafafa]
          [.project-workspaces_&]:[border-color:#efeef0]
          [.project-workspaces_&:last-child]:mb-[0] workspace`}
                key={l.url + i}
              >
                <div>
                  <a href={l.url} target="_blank" rel="noreferrer">
                    {l.name} ↗
                  </a>
                  <small>{l.url}</small>
                </div>
                {p.canEdit && (
                  <Action
                    onClick={() =>
                      action('save-project', {
                        ...p,
                        links: p.links.filter((_, n) => n !== i),
                      }).catch((err) => notify(err.message))
                    }
                  >
                    삭제
                  </Action>
                )}
              </div>
            ))}
            {!p.links.length && (
              <p
                className={`text-center text-muted p-[35px]
          [.original-columns_&]:text-[#9c93a9]
          [.original-columns_&]:[background:#fbfbfb]
          [.original-columns_&]:[border-width:1px]
          [.original-columns_&]:[border-style:dashed]
          [.original-columns_&]:[border-color:#e9e8eb]
          [.original-columns_&]:rounded-[13px]
          [.original-columns_&]:m-[0_0_18px]
          [.original-columns_&]:p-[42px_12px]
          [.original-columns_&]:text-[12px]
          [.original-columns_&]:leading-[1.9] empty`}
              >
                첫 번째 작업 공간을 등록해 보세요.
              </p>
            )}
          </section>
        </section>
      ) : (
        <section
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
          등록된 프로젝트가 없습니다. 새 프로젝트를 추가해 보세요.
        </section>
      )}
    </>
  );
}
export function ProjectEditor({ project, onClose }) {
  const { action, navigate } = useHub(),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await action('save-project', {
        ...Object.fromEntries(new FormData(e.currentTarget)),
        id: project?.id,
        links: project?.links || [],
      });
      navigate('#projects/' + result.id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={project ? '프로젝트 수정' : '새 프로젝트 등록'} onClose={onClose}>
      <p
        className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
      >
        프로젝트는 로그인 회원에게 공개되며 작성자만 수정할 수 있습니다.
      </p>
      <form onSubmit={submit}>
        <label>
          프로젝트 이름
          <input name="title" required maxLength={100} defaultValue={project?.title} />
        </label>
        <label>
          프로젝트 소개
          <textarea
            name="summary"
            required
            maxLength={2000}
            rows={4}
            defaultValue={project?.summary}
          />
        </label>
        <label>
          진행 상태
          <select name="state" defaultValue={project?.state || states[0]}>
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          팀 구성 (선택)
          <input name="members" maxLength={200} defaultValue={project?.members} />
        </label>
        <ErrorText message={error} />
        <div
          className={`mt-5 flex-wrap gap-2.5 flex
          [.original-boards_&]:grid-cols-[repeat(auto-fit,minmax(125px,1fr))]
          [.original-boards_&]:gap-2.5
          [.original-boards_&]:mt-4.5
          [.original-boards_&]:grid
          max-[650px]:[.original-boards_&]:grid-cols-[repeat(2,minmax(0,1fr))]
          [.original-welcome_&]:gap-2 actions`}
        >
          <button
            className={`bg-brand text-white [border-color:var(--color-brand)] shadow-[0_4px_12px_#8b5ad11c] hover:text-white
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
            저장
          </button>
          <Action onClick={onClose}>취소</Action>
        </div>
      </form>
    </Modal>
  );
}
export function LinkEditor({ project, onClose }) {
  const { action } = useHub(),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await action('save-project', {
        ...project,
        links: [...project.links, { name: String(f.get('name')), url: String(f.get('url')) }],
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="팀 작업 공간 추가" onClose={onClose}>
      <form onSubmit={submit}>
        <label>
          공간 이름
          <input name="name" required maxLength={60} />
        </label>
        <label>
          HTTPS 링크
          <input name="url" type="url" required maxLength={2000} placeholder="https://" />
        </label>
        <ErrorText message={error} />
        <button
          className={`bg-brand text-white [border-color:var(--color-brand)] shadow-[0_4px_12px_#8b5ad11c] hover:text-white
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
          max-[650px]:[.original-programs_>_&]:w-full w-full mt-4
          [.signup-dialog_.primary&]:[background:#462279]
          [.signup-dialog_.primary&]:[border-color:#462279]
          [.signup-dialog_.primary&]:mt-2.5 primary wide`}
          disabled={busy}
        >
          링크 추가
        </button>
      </form>
    </Modal>
  );
}
