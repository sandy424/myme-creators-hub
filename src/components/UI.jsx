import { useEffect, useRef } from 'react';
export function Icon({ name = 'enter' }) {
  const paths = {
    enter: <path d="M13 4h6v16h-6M3 12h11m-4-4 4 4-4 4" />,
    shield: (
      <>
        <path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" />
        <path d="M12 4v15" />
      </>
    ),
    person: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M19 7v6m-3-3h6" />
      </>
    ),
    key: (
      <>
        <circle cx="15" cy="8" r="4" />
        <path d="m12 11-8 9H2v-3l8-8M5 16l3 3" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.enter}
    </svg>
  );
}
export function Avatar({ user = {} }) {
  const photo = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(user.photo || '')
    ? user.photo
    : null;
  return (
    <span
      className={
        `text-[#8b5ad1] rounded-full [place-items:center] w-[37px] h-[37px] grid [background:#efeef1]!
          text-[14px]!
          [.membercard_&]:w-[65px]
          [.membercard_&]:h-[65px]
          [.membercard_&]:m-[0_auto_15px]
          [.membercard_&]:text-[21px]!
          [.chat-contact_&]:shrink-0
          max-[760px]:[.chat-contact_&]:w-[29px]
          max-[760px]:[.chat-contact_&]:h-[29px]
          [.member-summary_&]:shrink-0
          [.public-profile-avatar_&]:text-[#8b5ad1]
          [.public-profile-avatar_&]:[border-width:4px]
          [.public-profile-avatar_&]:[border-style:solid]
          [.public-profile-avatar_&]:[border-color:#fff]
          [.public-profile-avatar_&]:rounded-full
          [.public-profile-avatar_&]:w-21.5
          [.public-profile-avatar_&]:h-21.5
          [.public-profile-avatar_&]:[background:#996ed6]!
          [.public-profile-avatar_&]:text-[28px]! [#account_&]:p-[0] [#account_&]:overflow-hidden
          [.profile-photo-preview_&]:rounded-[16px]
          [.profile-photo-preview_&]:w-full
          [.profile-photo-preview_&]:h-full
          [.profile-photo-preview_&_img]:object-cover
          [.profile-photo-preview_&_img]:w-full
          [.profile-photo-preview_&_img]:h-full [#account_>_.avatar_>_&]:rounded-[inherit]
          [#account_>_.avatar_>_&]:w-full [#account_>_.avatar_>_&]:h-full avatar ` +
        (user.tone || '')
      }
    >
      {photo ? (
        <img
          className={`object-cover rounded-full w-full h-full block
          [.public-profile-dialog_.avatar_&]:rounded-full profile-photo`}
          src={photo}
          alt="프로필 사진"
        />
      ) : (
        user.initial || user.name?.[0] || 'M'
      )}
    </span>
  );
}
export function Tag({ category }) {
  return (
    <span
      className={
        `text-[#743ac8] [background:#f6f6f7] [border-width:1px] [border-style:solid] [border-color:#efeef1]
          rounded-[5px] p-[3px_8px] text-[10px] font-[700] inline-block
          [.project-choice_&]:[align-self:flex-start]
          [.original-member_&]:ml-2
          [.public-name_&]:rounded-[20px] tag ` +
        (category === '질문·답변'
          ? '[.tag&]:text-[#552a93] [.tag&]:[background:#f5f4f6] [.tag&]:[border-color:#e2e1e4] orange'
          : category === '작품·개발일지'
            ? '[.tag&]:text-[#381b61] [.tag&]:[background:#f4f4f5] [.tag&]:[border-color:#e5e4e7] green'
            : '')
      }
    >
      {category || '미분류'}
    </span>
  );
}
export function Modal({ title, kind = '', onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    node.showModal();
    return () => node.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={
        `[border-width:1px] [border-style:solid] [border-color:var(--color-line)] [border-radius:20px]
          [width:calc(100%_-_32px)] [max-width:470px] [max-height:90dvh] [padding:27px] [overflow-y:auto]
          [box-shadow:0_24px_80px_#3a215d30] [&::backdrop]:[backdrop-filter:blur(5px)]
          [&::backdrop]:[background:#26173c66] ` + kind
      }
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div
        className={`justify-between items-center flex [&_h2]:m-[0] [&_h2]:text-[20px]
          [.chat-dialog_&]:[border-bottom-width:1px]
          [.chat-dialog_&]:[border-bottom-style:solid]
          [.chat-dialog_&]:[border-bottom-color:var(--color-line)]
          [.chat-dialog_&]:bg-white
          [.chat-dialog_&]:p-[19px_24px]
          max-[760px]:[.chat-dialog_&]:p-[13px_16px]
          [.chat-dialog_&_h2]:text-[18px]
          max-[760px]:[.chat-dialog_&_h2]:text-[16px]
          [.public-profile-dialog_&]:z-[3]
          [.public-profile-dialog_&]:pointer-events-none
          [.public-profile-dialog_&]:h-[0]
          [.public-profile-dialog_&]:p-[0]
          [.public-profile-dialog_&]:absolute
          [.public-profile-dialog_&]:inset-[0_0_auto]
          [.public-profile-dialog_&_h2]:text-[#d5d0dc]
          [.public-profile-dialog_&_h2]:max-w-[calc(100%_-_100px)]
          [.public-profile-dialog_&_h2]:m-[0]
          [.public-profile-dialog_&_h2]:text-[11px]
          [.public-profile-dialog_&_h2]:font-[500]
          [.public-profile-dialog_&_h2]:leading-[20px]
          [.public-profile-dialog_&_h2]:absolute
          [.public-profile-dialog_&_h2]:top-5
          [.public-profile-dialog_&_h2]:left-7
          [.auth-dialog_&]:text-white
          [.auth-dialog_&]:[background:#1a0f2a]
          [.auth-dialog_&]:justify-between
          [.auth-dialog_&]:items-center
          [.auth-dialog_&]:min-h-19
          [.auth-dialog_&]:p-[20px_24px]
          [.auth-dialog_&]:flex
          max-[380px]:[.auth-dialog_&]:p-[18px_20px] dialoghead`}
      >
        {kind.includes('auth-dialog') ? (
          <>
            <div
              className={`items-center gap-2.5 flex
          [.auth-dialog_&_h2]:text-white
          [.auth-dialog_&_h2]:m-[0]
          [.auth-dialog_&_h2]:text-[14px]
          [.auth-dialog_&_h2]:font-[900]
          [.auth-dialog_&_h2]:leading-[20px] [&_small]:text-[#a884dc] [&_small]:mt-1 [&_small]:text-[10px]
          [&_small]:font-[800] [&_small]:block auth-identity`}
            >
              <span
                className={`[background:linear-gradient(40deg,#8b5ad1,#6230aa)] rounded-[12px] shrink-0 [place-items:center] w-8
          h-8 grid [&_svg]:w-4.5 [&_svg]:h-4.5 auth-shield`}
              >
                <Icon name="shield" />
              </span>
              <div>
                <h2>MYME 크리에이터 인증</h2>
                <small>안전한 로그인 세션</small>
              </div>
            </div>
            <button
              type="button"
              className={`focus-visible:outline-offset-[3px] focus-visible:[outline:2px_solid_#b697e2]
          [.auth-dialog_&]:text-[#a49ab2]
          [.auth-dialog_&]:[background:0_0]
          [.auth-dialog_&]:[border-width:0]
          [.auth-dialog_&]:[border-style:none]
          [.auth-dialog_&]:[border-color:currentColor]
          [.auth-dialog_&]:rounded-[5px]
          [.auth-dialog_&]:p-[2px_0_2px_12px]
          [.auth-dialog_&]:text-[25px]
          [.auth-dialog_&]:leading-[24px] auth-close`}
              aria-label="닫기"
              onClick={onClose}
            >
              ×
            </button>
          </>
        ) : (
          <>
            <h2>{title}</h2>
            <button
              type="button"
              className={`[border-width:0] [border-style:none] [border-color:currentColor] p-[4px_10px] text-[22px]
          [.chat-dialog_&]:text-[#746788]
          [.chat-dialog_&]:[background:#f5f4f6]
          [.chat-dialog_&]:rounded-full
          [.chat-dialog_&]:w-7.5
          [.chat-dialog_&]:h-7.5
          [.chat-dialog_&]:p-[0]
          [.chat-dialog_&]:text-[20px]
          [.public-profile-dialog_.dialoghead_&]:text-white
          [.public-profile-dialog_.dialoghead_&]:pointer-events-auto
          [.public-profile-dialog_.dialoghead_&]:[background:#ffffff14]
          [.public-profile-dialog_.dialoghead_&]:[border-width:1px]
          [.public-profile-dialog_.dialoghead_&]:[border-style:solid]
          [.public-profile-dialog_.dialoghead_&]:[border-color:#ffffff30]
          [.public-profile-dialog_.dialoghead_&]:rounded-full
          [.public-profile-dialog_.dialoghead_&]:[place-items:center]
          [.public-profile-dialog_.dialoghead_&]:w-9
          [.public-profile-dialog_.dialoghead_&]:h-9
          [.public-profile-dialog_.dialoghead_&]:m-[0]
          [.public-profile-dialog_.dialoghead_&]:p-[0]
          [.public-profile-dialog_.dialoghead_&]:text-[26px]
          [.public-profile-dialog_.dialoghead_&]:leading-[1]
          [.public-profile-dialog_.dialoghead_&]:grid
          [.public-profile-dialog_.dialoghead_&]:absolute
          [.public-profile-dialog_.dialoghead_&]:top-4
          [.public-profile-dialog_.dialoghead_&]:right-4
          [.public-profile-dialog_.dialoghead_&:hover]:[background:#ffffff30]
          [.public-profile-dialog_.dialoghead_&:hover]:[border-color:#ffffff70]
          [.public-profile-dialog_.dialoghead_&:focus-visible]:outline-offset-[3px]
          [.public-profile-dialog_.dialoghead_&:focus-visible]:[outline:2px_solid_#ccb6eb] close`}
              aria-label="닫기"
              onClick={onClose}
            >
              ×
            </button>
          </>
        )}
      </div>
      {children}
    </dialog>
  );
}
export function ErrorText({ message }) {
  return message ? (
    <p role="alert" className={'text-[#b42318] m-[12px_0] text-[12px] leading-[1.7] form-error'}>
      {message}
    </p>
  ) : null;
}
export function Action({ children, onClick, primary = false, ...props }) {
  return (
    <button
      type="button"
      className={
        primary
          ? `bg-brand text-white [border-color:var(--color-brand)] shadow-[0_4px_12px_#8b5ad11c] hover:text-white
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
          max-[650px]:[.original-programs_>_&]:w-full primary`
          : ''
      }
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
