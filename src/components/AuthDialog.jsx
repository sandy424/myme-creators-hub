import { useEffect, useState } from 'react';
import { api, languages } from '../api';
import { Modal, Icon, ErrorText } from './UI';
import CountrySelect, { exactCountry } from './CountrySelect';
export default function AuthDialog({ initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode),
    [country, setCountry] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [policies, setPolicies] = useState([]);
  const signup = mode === 'signup';
  useEffect(() => {
    fetch('/signup-policies.json')
      .then((r) => r.json())
      .then(setPolicies)
      .catch(() => setError('약관 안내를 불러오지 못했습니다.'));
  }, []);
  async function submit(e) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget),
      payload = Object.fromEntries(form);
    if (signup) {
      payload.country = exactCountry(country);
      for (const name of [
        'alumni',
        'discovery',
        'discoveryConfirmed',
        'sharedDiscovery',
        'termsConfirmed',
        'adultConfirmed',
        'privacyConfirmed',
      ])
        payload[name] = form.has(name);
      if (country.trim() && !payload.country) {
        setError('활동 국가 목록에서 선택하거나 정확한 국가명을 입력해 주세요.');
        return;
      }
      const missing = [];
      if (!payload.role?.trim()) missing.push('전문 분야');
      if (!payload.country) missing.push('활동 국가');
      if (!payload.languages) missing.push('사용 언어');
      if (!payload.discoveryConfirmed) missing.push('공개 대상 확인');
      if (payload.discovery && missing.length) {
        setError('다음 항목을 확인해 주세요: ' + missing.join(', '));
        return;
      }
    }
    setBusy(true);
    try {
      await api(mode, payload);
      await onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="회원 인증"
      kind={
        `[dialog&]:bg-white [dialog&]:[border-width:1px] [dialog&]:[border-style:solid]
          [dialog&]:[border-color:#d5d0dc] [dialog&]:rounded-[24px] [dialog&]:w-[calc(100%_-_32px)]
          [dialog&]:max-w-112 [dialog&]:max-h-[92dvh] [dialog&]:p-[0] [dialog&]:overflow-hidden
          [dialog&]:shadow-[0_25px_60px_#0004] [&::backdrop]:[backdrop-filter:blur(3px)]
          [&::backdrop]:[background:#000b] [&_label]:text-[#423a4e] [&_label]:m-[12px_0_0]
          [&_label]:text-[12px] [&_label]:font-[800] [&_label]:leading-[1.4] [&_label]:block
          [&_input]:text-[#1a0f2a] [&_input]:[background:#fafafa] [&_input]:[border-width:1px]
          [&_input]:[border-style:solid] [&_input]:[border-color:#d5d0dc] [&_input]:rounded-[12px]
          [&_input]:w-full [&_input]:min-h-9.5 [&_input]:mt-1 [&_input]:p-[10px_14px] [&_input]:text-[12px]
          [&_input]:font-[600] [&_input]:leading-[16px] [&_input]:block [&_select]:text-[#1a0f2a]
          [&_select]:[background:#fafafa] [&_select]:[border-width:1px] [&_select]:[border-style:solid]
          [&_select]:[border-color:#d5d0dc] [&_select]:rounded-[12px] [&_select]:w-full [&_select]:min-h-9.5
          [&_select]:mt-1 [&_select]:p-[10px_14px] [&_select]:text-[12px] [&_select]:font-[600]
          [&_select]:leading-[16px] [&_select]:block [&_input:focus]:outline-offset-[0]
          [&_input:focus]:[outline:2px_solid_#a17ada] [&_select:focus]:outline-offset-[0]
          [&_select:focus]:[outline:2px_solid_#a17ada]
          [&_input:-webkit-autofill]:[-webkit-box-shadow:inset_0_0_0_50px_#f3f2f4] auth-dialog ` +
        (signup
          ? `[dialog&]:max-w-112 [dialog&]:max-h-[92dvh] [dialog&]:p-6 [dialog&]:overflow-y-auto
          [dialog.auth-dialog&]:bg-white [dialog.auth-dialog&]:[border-width:1px]
          [dialog.auth-dialog&]:[border-style:solid] [dialog.auth-dialog&]:[border-color:#d5d0dc]
          [dialog.auth-dialog&]:rounded-[24px] [dialog.auth-dialog&]:w-[calc(100%_-_32px)]
          [dialog.auth-dialog&]:max-w-112 [dialog.auth-dialog&]:max-h-[92dvh] [dialog.auth-dialog&]:p-[0]
          [dialog.auth-dialog&]:overflow-hidden [dialog.auth-dialog&]:shadow-[0_25px_60px_#0004] signup-dialog`
          : '')
      }
      onClose={onClose}
    >
      <div
        className={`[&_button:focus-visible]:outline-offset-[3px] [&_button:focus-visible]:[outline:2px_solid_#b697e2]
          [background:#fafafa] [border-bottom-width:1px] [border-bottom-style:solid]
          [border-bottom-color:#e9e7eb] flex [&_button]:text-[#746788] [&_button]:[background:0_0]
          [&_button]:[border-width:0] [&_button]:[border-style:none] [&_button]:[border-color:currentColor]
          [&_button]:[border-bottom-width:2px] [&_button]:[border-bottom-style:solid]
          [&_button]:[border-bottom-color:#0000] [&_button]:rounded-[0] [&_button]:justify-center
          [&_button]:items-center [&_button]:gap-1.5 [&_button]:w-[50%] [&_button]:p-3 [&_button]:text-[12px]
          [&_button]:font-[800] [&_button]:flex [&_svg]:w-[13px] [&_svg]:h-[13px] auth-tabs`}
        role="tablist"
        aria-label="로그인 및 가입"
      >
        {[
          ['login', '로그인', 'enter'],
          ['signup', '새 계정 등록', 'person'],
        ].map(([key, label, icon]) => (
          <button
            type="button"
            role="tab"
            aria-selected={key === mode}
            className={
              key === mode
                ? `[.project-choice&]:[background:#f6f6f7]
          [.project-choice&]:[border-width:2px]
          [.project-choice&]:[border-style:solid]
          [.project-choice&]:[border-color:#a17ada]
          [.chat-contact&]:text-[#502e81]
          [.chat-contact&]:[background:#f5f4f6]
          [.chat-contact&]:[border-color:#eae9eb]
          [.auth-tabs_button&]:text-[#8b5ad1]
          [.auth-tabs_button&]:[border-bottom-color:#8b5ad1] selected`
                : ''
            }
            key={key}
            onClick={() => {
              setMode(key);
              setError('');
            }}
          >
            <Icon name={icon} />
            {label}
          </button>
        ))}
      </div>
      <div
        className={`[overscroll-behavior:contain]
          max-h-[calc(92dvh_-_120px)] p-6 overflow-y-auto
          max-[380px]:p-5 auth-content`}
      >
        <form
          id="auth-form"
          className={'[.auth-dialog_&_>_label:first-child]:mt-[0]'}
          onSubmit={submit}
        >
          {signup && (
            <label>
              이름 또는 닉네임
              <input
                name="name"
                required
                maxLength={30}
                autoComplete="nickname"
                placeholder="예: 김민우"
              />
            </label>
          )}
          <label>
            이메일 주소
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="username"
              placeholder="dev@example.com"
            />
          </label>
          <label>
            비밀번호{signup ? ' (8자 이상)' : ''}
            <input
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              autoComplete={signup ? 'new-password' : 'current-password'}
              placeholder="••••••••"
            />
          </label>
          {signup ? (
            <>
              <div
                className={`grid-cols-[1fr_1fr] gap-3 grid
          max-[380px]:grid-cols-[1fr]
          [.auth-dialog_&]:[align-items:start] signup-grid`}
              >
                <label>
                  주요 전문 분야
                  <input name="role" maxLength={250} placeholder="예: 게임 개발, 그래픽 아트" />
                </label>
                <CountrySelect value={country} onChange={setCountry} />
              </div>
              <section
                className={`[background:#fafafa] [border-width:1px] [border-style:solid] [border-color:#e2e1e4] rounded-[12px]
          mt-3.5 p-3 [&_>_label:first-child]:mt-[0] [&_p]:text-[#746788] [&_p]:text-[11px] [&_p]:leading-[1.6]
          [.auth-dialog_&_>_label:first-child]:mt-[0] signup-beta`}
              >
                <label>
                  주로 사용하는 언어
                  <select name="languages">
                    <option value="">선택해 주세요</option>
                    {Object.entries(languages).map(([code, name]) => (
                      <option value={code} key={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <p>
                  참여한 MYME 행사·교육이 있다면 입력하세요. 본인 입력 정보이며 회사 공식 확인
                  이력과 구분됩니다.
                </p>
                <label>
                  행사·교육명 (선택)
                  <input
                    name="affiliationProgram"
                    maxLength={100}
                    placeholder="예: 글로벌 인디게임잼"
                  />
                </label>
                <label>
                  기수 (선택)
                  <input name="affiliationCohort" maxLength={30} placeholder="예: 3기" />
                </label>
                <Check name="alumni">해당 행사·교육의 동문입니다 (본인 입력)</Check>
                <Check name="discovery" defaultChecked>
                  가입 후 이메일 인증이 완료되면 닉네임·전문 분야·활동 국가·언어를 동료 찾기에
                  공개합니다.
                </Check>
                <Check name="discoveryConfirmed">
                  위 공개 대상·항목을 확인했습니다. 비공개 가입은 공개 선택을 해제하세요.
                  행사·기수는 별도로 공개하기 전에는 표시되지 않습니다.
                </Check>
              </section>
              <Check name="sharedDiscovery">
                [선택] 현재 서비스에서 닉네임·전문 분야를 다른 로그인 회원의 동료 찾기에 즉시
                공개합니다. 내 프로필에서 철회할 수 있습니다.
              </Check>
              <Check name="termsConfirmed" required>
                [필수] 주식회사 공감오래콘텐츠의 이용약관에 동의합니다.
              </Check>
              <details
                className={`m-[10px_0] text-[11px] [&_summary]:text-[#8b5ad1] [&_summary]:cursor-pointer [&_summary]:underline
          [&_section]:[border-top-width:1px] [&_section]:[border-top-style:solid]
          [&_section]:[border-top-color:#e9e7eb] [&_section]:mt-3 [&_section]:pt-2 [&_h3]:text-[12px]
          signup-policies`}
              >
                <summary>이용약관·개인정보 안내 보기</summary>
                <p
                  className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
                >
                  제공 소스의 베타 안내입니다. 이메일 인증은 미연결이며 즉시 공개 항목은 별도
                  선택입니다. 운영 배포 시 실제 운영 정책과 연결해 주세요.
                </p>
                {policies.map((p) => (
                  <section key={p.version}>
                    <h3>{p.title}</h3>
                    <small>{p.version}</small>
                    <p className="whitespace-pre-line">{p.text}</p>
                  </section>
                ))}
              </details>
              <Check name="adultConfirmed" required>
                [필수] 성인 대상 서비스임을 확인했으며 성인입니다. (자기확인)
              </Check>
              <Check name="privacyConfirmed" required>
                [필수] 베타 개인정보 처리 안내를 확인했습니다. 동료 찾기 공개와 외부 심사 공유는
                별도 선택입니다.
              </Check>
              <div
                className={`text-[#48237d] [background:#f5f4f6] [border-width:1px] [border-style:solid] [border-color:#ba9ee3]
          rounded-[12px] m-[14px_0] p-3 text-[11px] leading-[1.6] [&_small]:text-[#746788] [&_small]:mt-1.5
          [&_small]:block signup-mail-note`}
              >
                가입 보너스 포인트는 지급하지 않습니다.
                <small>
                  인증 메일 발송은 아직 미연결입니다. 즉시 공개를 선택하면 현재 회원 간 프로필
                  조회가 가능합니다.
                </small>
              </div>
            </>
          ) : (
            <button
              type="button"
              className={`[.auth-dialog_&]:text-[#8b5ad1]
          [.auth-dialog_&]:[background:0_0]
          [.auth-dialog_&]:[border-width:0]
          [.auth-dialog_&]:[border-style:none]
          [.auth-dialog_&]:[border-color:currentColor]
          [.auth-dialog_&]:rounded-[0]
          [.auth-dialog_&]:mt-3
          [.auth-dialog_&]:p-[0]
          [.auth-dialog_&]:text-[12px]
          [.auth-dialog_&]:font-[400]
          [.auth-dialog_&]:underline
          [.auth-dialog_&]:inline-block auth-forgot`}
              onClick={() => setError('비밀번호 재설정 메일은 아직 연결되지 않았습니다.')}
            >
              비밀번호를 잊으셨나요?
            </button>
          )}
          <ErrorText message={error} />
          <button
            type="submit"
            disabled={busy}
            className={
              `[.auth-dialog_&]:text-white
          [.auth-dialog_&]:[background:#8b5ad1]
          [.auth-dialog_&]:[border-width:0]
          [.auth-dialog_&]:[border-style:none]
          [.auth-dialog_&]:[border-color:currentColor]
          [.auth-dialog_&]:rounded-[12px]
          [.auth-dialog_&]:justify-center
          [.auth-dialog_&]:items-center
          [.auth-dialog_&]:gap-[7px]
          [.auth-dialog_&]:w-full
          [.auth-dialog_&]:mt-3.5
          [.auth-dialog_&]:p-3
          [.auth-dialog_&]:text-[12px]
          [.auth-dialog_&]:font-[900]
          [.auth-dialog_&]:leading-[16px]
          [.auth-dialog_&]:flex
          [.auth-dialog_&]:shadow-[0_3px_5px_#8b5ad133] [&_svg]:w-[15px] [&_svg]:h-[15px]
          [.auth-dialog_&:hover]:[background:#743ac8] auth-submit ` +
              (signup
                ? `[.auth-dialog_&]:[background:#462279]
          [.auth-dialog_&]:shadow-[0_3px_5px_#46227933]
          [.auth-dialog_&:hover]:[background:#381b61] auth-register-submit`
                : '')
            }
          >
            <Icon name={signup ? 'person' : 'key'} />
            {busy ? '처리 중…' : signup ? '회원가입 완료 & 자동 로그인' : '로그인'}
          </button>
        </form>
      </div>
    </Modal>
  );
}
export function Check({ name, children, ...props }) {
  return (
    <label
      className={`[.signup-dialog_&]:items-start
          [.signup-dialog_&]:gap-2
          [.signup-dialog_&]:text-[11px]
          [.signup-dialog_&]:font-[400]
          [.signup-dialog_&]:leading-[1.55]
          [.signup-dialog_&]:flex [&_input[type='checkbox']]:[accent-color:#7c45cb]
          [&_input[type='checkbox']]:w-[13px] [&_input[type='checkbox']]:min-w-[13px]
          [&_input[type='checkbox']]:h-[13px] [&_input[type='checkbox']]:m-[2px_0_0]
          [&_input[type='checkbox']]:p-[0]
          [.auth-dialog_&]:font-[400]
          [.auth-dialog_&]:flex
          [.auth-dialog_&_input]:w-[13px]
          [.auth-dialog_&_input]:min-h-[13px]
          [.auth-dialog_&_input]:mt-0.5
          [.auth-dialog_&_input]:inline-block
          [.profile-dialog_&]:items-start
          [.profile-dialog_&]:gap-2
          [.profile-dialog_&]:leading-[1.6]
          [.profile-dialog_&]:flex
          [.profile-dialog_&_input[type='checkbox']]:[accent-color:#8b5ad1]
          [.profile-dialog_&_input[type='checkbox']]:w-[15px]
          [.profile-dialog_&_input[type='checkbox']]:min-w-[15px]
          [.profile-dialog_&_input[type='checkbox']]:h-[15px]
          [.profile-dialog_&_input[type='checkbox']]:m-[3px_0_0] signup-check`}
    >
      <input name={name} type="checkbox" {...props} />
      <span>{children}</span>
    </label>
  );
}
