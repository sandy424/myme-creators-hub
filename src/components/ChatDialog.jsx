import { useState } from 'react';
import { useHub } from '../HubContext';
import { Modal, Avatar, ErrorText } from './UI';
import { languages } from '../api';
import { useReadNotices } from '../useReadNotices';
export default function ChatDialog({ initialId, onClose }) {
  const { state, action } = useHub(),
    [selected, setSelected] = useState(initialId),
    [text, setText] = useState(''),
    [language, setLanguage] = useState('ko'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const peers = state.members.filter(
      (m) =>
        m.status === '동료' ||
        String(m.id) === String(selected) ||
        Object.hasOwn(state.chats, m.id),
    ),
    peer = state.members.find((m) => m.id === Number(selected)) || peers[0],
    messages = peer ? state.chats[peer.id] || [] : [];
  useReadNotices(
    state.notices
      .filter((notice) => !notice.read && notice.type === 'message' && notice.peerId === peer?.id)
      .map((notice) => notice.id),
  );
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await action('send-message', { peerId: peer.id, text, lang: language });
      setText('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="실시간 통역 채팅"
      kind={`[dialog&]:rounded-[22px] [dialog&]:max-w-210 [dialog&]:p-[0] [dialog&]:overflow-hidden
          [dialog&]:shadow-[0_30px_100px_#1a0f2a50]
          max-[760px]:[dialog&]:rounded-[16px]
          max-[760px]:[dialog&]:w-[calc(100%_-_16px)]
          max-[760px]:[dialog&]:max-h-[95dvh] chat-dialog`}
      onClose={onClose}
    >
      <div
        className={`grid-cols-[225px_1fr] h-[min(580px,90dvh_-_80px)] grid
          max-[760px]:grid-rows-[auto_minmax(0,1fr)]
          max-[760px]:grid-cols-[1fr]
          max-[760px]:h-[min(650px,94dvh_-_70px)] chat-layout`}
      >
        <aside
          className={`[border-right-width:1px] [border-right-style:solid] [border-right-color:var(--color-line)]
          [background:#fafafa] p-[20px_12px] relative
          max-[760px]:[border-right-width:0]
          max-[760px]:[border-right-style:none]
          max-[760px]:[border-right-color:currentColor]
          max-[760px]:[border-bottom-width:1px]
          max-[760px]:[border-bottom-style:solid]
          max-[760px]:[border-bottom-color:var(--color-line)]
          max-[760px]:gap-1.5
          max-[760px]:min-h-[65px]
          max-[760px]:p-[9px]
          max-[760px]:flex
          max-[760px]:overflow-x-auto chat-sidebar`}
        >
          <p
            className={`text-[#746788] m-[0_8px_13px] text-[11px] font-[700] [&_>_span]:text-[#8b5ad1] [&_>_span]:ml-[5px]
          max-[760px]:[.chat-sidebar_&]:hidden chat-section-label`}
          >
            대화 목록 <span>{peers.length}</span>
          </p>
          {peers.map((m) => (
            <button
              key={m.id}
              className={
                `text-left [background:0_0] [border-width:1px] [border-style:solid] [border-color:#0000] items-center
          gap-2.5 w-full mb-1.5 p-[12px_9px] flex
          max-[760px]:shrink-0
          max-[760px]:w-auto
          max-[760px]:min-w-35
          max-[760px]:m-[0]
          max-[760px]:p-[7px] [&_strong]:text-[12px] [&_strong]:block [&_small]:text-[#746788]
          [&_small]:mt-[3px] [&_small]:text-[10px] [&_small]:block
          max-[760px]:[&_small]:hidden chat-contact ` +
                (m.id === peer?.id
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
              onClick={() => {
                setSelected(m.id);
                setError('');
              }}
            >
              <Avatar user={m} />
              <span>
                <strong>{m.name}</strong>
                <small>{m.role}</small>
              </span>
            </button>
          ))}
          {!peers.length && (
            <p
              className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
            >
              동료 찾기에서 대화를 시작해 보세요.
            </p>
          )}
          <p
            className={`text-[#ada4bb] text-[13px] leading-[1.8] absolute bottom-4.5 left-5.5
          max-[760px]:hidden chat-sidebar-note`}
          >
            언어가 달라도,
            <br />
            아이디어는 함께.
          </p>
        </aside>
        <section
          className={
            'bg-white flex-col min-w-0 min-h-0 flex max-[760px]:overflow-hidden chat-conversation'
          }
        >
          {peer ? (
            <>
              <div
                className={`[border-bottom-width:1px] [border-bottom-style:solid] [border-bottom-color:var(--color-line)]
          justify-between items-center gap-[15px] p-[15px_20px] flex
          max-[760px]:p-[10px_14px] [&_strong]:text-[13px] [&_small]:text-[#a49ab2] [&_small]:text-[10px]
          [&_small]:block [&_label]:text-[#746788] [&_label]:m-[0] [&_label]:text-[10px] [&_select]:bg-white
          [&_select]:w-[115px] [&_select]:mt-[3px] [&_select]:p-[5px] [&_select]:text-[11px] [&_select]:block
          chat-peer-header`}
              >
                <div className={'items-center gap-[11px] flex row'}>
                  <Avatar user={peer} />
                  <div>
                    <strong>{peer.name}</strong>
                    <small>1:1 대화</small>
                  </div>
                </div>
                <label>
                  번역 언어
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div
                className={`text-[#746788] [background:#fafafa] [border-bottom-width:1px] [border-bottom-style:solid]
          [border-bottom-color:#f5f4f6] p-[9px_18px] text-[10px] leading-[1.7] [&_span]:text-[#a17ada]
          [&_span]:mr-[7px] [&_span]:font-[750] chat-offline`}
              >
                <span>메시지</span> 자동 번역은 아직 연결되지 않았습니다.
              </div>
              <div
                className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] [background:#fafafa]
          rounded-[14px] h-75 m-[20px_0] p-3.5 overflow-y-auto
          [.chat-dialog_&]:[background:#f8f8f9]
          [.chat-dialog_&]:[border-width:0]
          [.chat-dialog_&]:[border-style:none]
          [.chat-dialog_&]:[border-color:currentColor]
          [.chat-dialog_&]:rounded-[0]
          [.chat-dialog_&]:flex-1
          [.chat-dialog_&]:h-auto
          [.chat-dialog_&]:min-h-30
          [.chat-dialog_&]:m-[0]
          [.chat-dialog_&]:p-[23px_20px]
          max-[760px]:[.chat-dialog_&]:p-[15px] chat-messages`}
                role="log"
                aria-label="대화 내역"
              >
                {messages.map((m) => (
                  <div
                    className={
                      `[border-width:1px] [border-style:solid] [border-color:var(--color-line)] bg-white rounded-[13px]
          m-[0_25px_14px_0] p-[13px] text-[12px] [&_p]:whitespace-pre-wrap [&_p]:[overflow-wrap:anywhere]
          [&_p]:m-[8px_0] [&_p]:text-[13px] [&_p]:leading-[1.7] [&_small]:text-muted
          [&_small]:[border-top-width:1px] [&_small]:[border-top-style:solid]
          [&_small]:[border-top-color:#e9e7eb] [&_small]:pt-2 [&_small]:text-[11px] [&_small]:leading-[1.7]
          [&_small]:block
          [.chat-dialog_&]:bg-white
          [.chat-dialog_&]:[border-width:1px]
          [.chat-dialog_&]:[border-style:solid]
          [.chat-dialog_&]:[border-color:#e9e7eb]
          [.chat-dialog_&]:rounded-[2px_15px_15px]
          [.chat-dialog_&]:mr-10
          [.chat-dialog_&]:p-[13px_15px]
          [.chat-dialog_&]:shadow-[0_2px_4px_#1a0f2a03] chat-bubble ` +
                      (m.mine
                        ? `[.chat-bubble&]:[background:#f6f6f7]
          [.chat-bubble&]:[border-color:#efeef1]
          [.chat-bubble&]:ml-[25px]
          [.chat-bubble&]:mr-[0]
          [.chat-dialog_.chat-bubble&]:text-white
          [.chat-dialog_.chat-bubble&]:[background:#8b5ad1]
          [.chat-dialog_.chat-bubble&]:[border-color:#8b5ad1]
          [.chat-dialog_.chat-bubble&]:rounded-[15px_2px_15px_15px]
          [.chat-dialog_.chat-bubble&]:ml-[45px]
          [.chat-dialog_.chat-bubble&]:mr-[0]
          [.chat-dialog_.chat-bubble&_small]:text-[#e2e1e4]
          [.chat-bubble&_small]:[border-color:#ffffff25] mine`
                        : '')
                    }
                    key={m.id}
                  >
                    <p>{m.text}</p>
                    <small>
                      {new Date(m.time).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </small>
                  </div>
                ))}
                {!messages.length && (
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
                    첫 메시지를 남겨 보세요.
                  </p>
                )}
              </div>
              <form
                id="preview-chat-form"
                className={`[.chat-dialog_&]:[border-top-width:1px]
          [.chat-dialog_&]:[border-top-style:solid]
          [.chat-dialog_&]:[border-top-color:var(--color-line)]
          [.chat-dialog_&]:p-[16px_20px_10px]
          max-[760px]:[.chat-dialog_&]:p-3
          [.chat-dialog_&_label]:m-[0]
          [.chat-dialog_&_label]:text-[10px]`}
                onSubmit={submit}
              >
                <label
                  htmlFor="chat-text"
                  className={`text-[#746788] m-[0_8px_13px] text-[11px] font-[700] [&_>_span]:text-[#8b5ad1] [&_>_span]:ml-[5px]
          max-[760px]:[.chat-sidebar_&]:hidden chat-section-label`}
                >
                  메시지 작성
                </label>
                <div
                  className={`gap-2 mt-1.5 flex [&_input]:rounded-[12px] [&_input]:min-w-0 [&_input]:text-[12px]
          [&_button]:rounded-[12px] [&_button]:shrink-0 [&_button]:text-[12px]
          [.chat-dialog_&]:mt-2 chat-compose`}
                >
                  <input
                    id="chat-text"
                    required
                    maxLength={2000}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="동료에게 메시지를 남겨 보세요"
                  />
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
                    전송 ↗
                  </button>
                </div>
                <ErrorText message={error} />
              </form>
            </>
          ) : (
            <div
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
              아직 대화 상대가 없습니다.
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
