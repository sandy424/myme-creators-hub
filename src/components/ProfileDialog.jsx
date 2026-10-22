import { useState } from 'react';
import { Modal, Avatar, Action, ErrorText } from './UI';
import CountrySelect, { exactCountry } from './CountrySelect';
import { publicOptions, safeUrl } from '../api';
import { Check } from './AuthDialog';
export default function ProfileDialog({ user, onClose, onSave }) {
  const [country, setCountry] = useState(user.country || ''),
    [photo, setPhoto] = useState(user.photo || ''),
    [busy, setBusy] = useState(false),
    [reading, setReading] = useState(false),
    [error, setError] = useState('');
  async function readPhoto(file) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1048576) {
      setError('JPG·PNG·WEBP 형식의 1MB 이하 사진을 선택해 주세요.');
      return;
    }
    setReading(true);
    try {
      const bitmap = await createImageBitmap(file),
        canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const side = Math.min(bitmap.width, bitmap.height);
      canvas
        .getContext('2d')
        .drawImage(
          bitmap,
          (bitmap.width - side) / 2,
          (bitmap.height - side) / 2,
          side,
          side,
          0,
          0,
          256,
          256,
        );
      setPhoto(canvas.toDataURL('image/png'));
      bitmap.close();
      setError('');
    } catch {
      setError('정상적인 사진 파일을 선택해 주세요.');
    } finally {
      setReading(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    if (reading) return;
    const f = new FormData(e.currentTarget),
      portfolio = String(f.get('portfolio') || '').trim();
    setBusy(true);
    try {
      const c = exactCountry(country);
      if (country && !c) throw Error('국가 목록에서 선택하거나 정확한 국가명을 입력해 주세요.');
      await onSave({
        ...user,
        name: String(f.get('name')).trim(),
        role: String(f.get('role')).trim(),
        bio: String(f.get('bio')).trim(),
        portfolio: portfolio ? safeUrl(portfolio) : '',
        country: c,
        languages: String(f.get('languages')).trim(),
        photo,
        publicFields: f.getAll('publicFields'),
        sharedDiscovery: f.has('sharedDiscovery'),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="내 프로필"
      kind={'[dialog&]:max-w-[650px] [&_textarea]:mt-[6px] profile-dialog'}
      onClose={onClose}
    >
      <p
        className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
      >
        나를 소개하고 함께할 동료에게 작품을 보여 주세요.
      </p>
      <form onSubmit={submit}>
        <section
          className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] [background:#fafafa]
          rounded-[16px] items-center gap-6 m-[20px_0] p-5 flex
          max-[600px]:gap-[15px]
          max-[600px]:p-[15px] [&_p]:m-[4px_0] profile-photo-editor`}
        >
          <div
            className={`text-[#8b5ad1] [background:#efeef1] rounded-full shrink-0 [place-items:center] w-22.5 h-22.5
          text-[34px] grid overflow-hidden
          max-[600px]:w-18
          max-[600px]:h-18 profile-photo-preview`}
          >
            <Avatar user={{ ...user, photo }} />
          </div>
          <div>
            <strong>프로필 사진</strong>
            <p
              className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
            >
              JPG·PNG·WEBP / 최대 1MB
            </p>
            <label
              className={`text-[#743ac8] cursor-pointer bg-white [border-width:1px] [border-style:solid] [border-color:#e2e1e4]
          rounded-[8px] mt-1.5 p-[7px_12px] text-[12px] inline-block [&_input]:opacity-[0] [&_input]:w-[1px]
          [&_input]:h-[1px] [&_input]:p-[0] [&_input]:absolute [&:focus-within]:outline-offset-[3px]
          [&:focus-within]:[outline:2px_solid_#a17ada] photo-upload`}
            >
              사진 선택
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => readPhoto(e.target.files[0])}
              />
            </label>
            <Action onClick={() => setPhoto('')}>사진 삭제</Action>
          </div>
        </section>
        <div
          className={
            'grid-cols-[1fr_1fr] gap-[16px] grid max-[600px]:grid-cols-[1fr] [&_label]:m-[0] profile-fields'
          }
        >
          <label>
            닉네임
            <input name="name" required maxLength={30} defaultValue={user.name} />
          </label>
          <label>
            전문 분야
            <input
              name="role"
              maxLength={250}
              defaultValue={user.role}
              placeholder="예: 게임 기획, Unity 개발"
            />
          </label>
        </div>
        <label>
          소개글
          <textarea name="bio" maxLength={1000} rows={4} defaultValue={user.bio} />
        </label>
        <label>
          포트폴리오 링크
          <input
            name="portfolio"
            type="url"
            maxLength={2000}
            defaultValue={user.portfolio}
            placeholder="https://"
          />
        </label>
        <CountrySelect value={country} onChange={setCountry} />
        <label>
          활동 언어
          <input name="languages" maxLength={200} defaultValue={user.languages} />
        </label>
        <Check name="sharedDiscovery" defaultChecked={user.sharedDiscovery}>
          다른 로그인 회원의 동료 찾기에 내 프로필 공개
        </Check>
        <p
          className={`text-muted text-[12px]
          [.team-welcome_&]:m-[0_0_15px]
          [.member-card-actions_&]:m-[5px]
          [.original-programs_&]:m-[0]
          [.original-programs_&]:text-[12px] muted`}
        >
          공개 시 닉네임·전문 분야와 아래에서 선택한 항목만 표시됩니다. 이메일·행사·기수는 공개되지
          않습니다.
        </p>
        <fieldset
          className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] rounded-[12px] m-[22px_0]
          p-[15px] [&_legend]:text-[13px] [&_legend]:font-[750] profile-disclosure`}
        >
          <legend>다른 회원에게 공개할 정보</legend>
          <div
            className={`grid-cols-[1fr_1fr] gap-2 grid [&_label]:[background:#fafafa] [&_label]:rounded-[7px]
          [&_label]:items-center [&_label]:gap-2 [&_label]:m-[0] [&_label]:p-2 [&_label]:text-[12px]
          [&_label]:flex [&_input]:[accent-color:#8b5ad1] [&_input]:w-[15px] [&_input]:h-[15px] [&_input]:m-[0]
          disclosure-options`}
          >
            {Object.entries(publicOptions).map(([key, label]) => (
              <label key={key}>
                <input
                  name="publicFields"
                  type="checkbox"
                  value={key}
                  defaultChecked={user.publicFields?.includes(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <ErrorText message={error} />
        <button
          type="submit"
          disabled={busy || reading}
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
        >
          {busy ? '저장 중…' : '프로필 저장'}
        </button>
      </form>
    </Modal>
  );
}
export function PublicProfile({ member, onClose, onChat, onConnect }) {
  return (
    <Modal
      title="공개 프로필"
      kind={`[dialog&]:[border-width:0] [dialog&]:[border-style:none] [dialog&]:[border-color:currentColor]
          [dialog&]:rounded-[24px] [dialog&]:max-w-[445px] [dialog&]:p-[0] [dialog&]:overflow-hidden
          max-[500px]:[dialog&]:w-[calc(100%_-_28px)] public-profile-dialog`}
      onClose={onClose}
    >
      <div
        className={
          '[background:linear-gradient(110deg,#1a0f2a,#2f1b4b)] h-[100px] relative public-profile-cover'
        }
      />
      <section
        className={`max-h-[calc(88dvh_-_100px)] p-[0_28px_22px] relative overflow-auto
          max-[500px]:p-[0_23px_22px] public-profile-body`}
      >
        <div className={'w-[96px] mt-[16px] relative public-profile-avatar'}>
          <Avatar user={member} />
          {member.country && (
            <span
              className={`bg-white [border-width:2px] [border-style:solid] [border-color:#e9e7eb] rounded-full
          [place-items:center]
          min-w-7.5 h-7.5 p-1 text-[10px] grid absolute bottom-[0] right-[0] public-country`}
            >
              {member.country === '대한민국' ? 'KR' : member.country.slice(0, 2)}
            </span>
          )}
        </div>
        <div
          className={
            'items-center gap-[12px] m-[18px_0_8px] flex [&_h2]:m-[0] [&_h2]:text-[25px] public-name'
          }
        >
          <h2>{member.name}</h2>
          {member.status && (
            <span
              className={`text-[#743ac8] [background:#f6f6f7] [border-width:1px] [border-style:solid] [border-color:#efeef1]
          rounded-[5px] p-[3px_8px] text-[10px] font-[700] inline-block
          [.project-choice_&]:[align-self:flex-start]
          [.original-member_&]:ml-2
          [.public-name_&]:rounded-[20px] tag`}
            >
              {member.status}
            </span>
          )}
        </div>
        <div
          className={'text-[#746788] flex-wrap items-center gap-[9px] text-[11px] flex public-meta'}
        >
          <span
            className={`text-[#743ac8] [background:#f6f6f7] [border-width:1px] [border-style:solid] [border-color:#efeef1]
          rounded-[5px] p-[3px_8px] text-[10px] font-[700] inline-block
          [.project-choice_&]:[align-self:flex-start]
          [.original-member_&]:ml-2
          [.public-name_&]:rounded-[20px] tag`}
          >
            {member.role || '크리에이터'}
          </span>
          <span>{[member.country, member.languages].filter(Boolean).join(' · ')}</span>
        </div>
        {member.bio && (
          <section
            className={`mt-6 [&_h3]:text-[#746788] [&_h3]:m-[0_0_10px] [&_h3]:text-[12px] [&_>_p]:whitespace-pre-wrap
          [&_>_p]:[overflow-wrap:anywhere] [&_>_p]:m-[0] [&_>_p]:text-[13px] [&_>_p]:leading-[1.9]
          public-section`}
          >
            <h3>소개</h3>
            <p>{member.bio}</p>
          </section>
        )}
        {member.portfolios?.length > 0 && (
          <section
            className={`mt-6 [&_h3]:text-[#746788] [&_h3]:m-[0_0_10px] [&_h3]:text-[12px] [&_>_p]:whitespace-pre-wrap
          [&_>_p]:[overflow-wrap:anywhere] [&_>_p]:m-[0] [&_>_p]:text-[13px] [&_>_p]:leading-[1.9]
          public-section`}
          >
            <h3>포트폴리오</h3>
            {member.portfolios.map((p, i) => {
              try {
                return (
                  <a
                    key={i}
                    className={`[border-width:1px] [border-style:solid] [border-color:var(--color-line)] rounded-[12px] items-center
          gap-[13px] mt-2 p-[12px_14px] text-[12px] flex [&_>_span:last-child]:text-[#746788]
          [&_>_span:last-child]:ml-auto [&_strong]:block [&_small]:text-[#746788] [&_small]:text-[10px]
          [&_small]:block public-portfolio`}
                    href={safeUrl(p.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {p.name} ↗
                  </a>
                );
              } catch {
                return null;
              }
            })}
          </section>
        )}
        {member.career?.length > 0 && (
          <section
            className={`mt-6 [&_h3]:text-[#746788] [&_h3]:m-[0_0_10px] [&_h3]:text-[12px] [&_>_p]:whitespace-pre-wrap
          [&_>_p]:[overflow-wrap:anywhere] [&_>_p]:m-[0] [&_>_p]:text-[13px] [&_>_p]:leading-[1.9]
          public-section`}
          >
            <h3>공개 커리어</h3>
            {member.career.map((c, i) => (
              <div
                className={`[border-top-width:1px] [border-top-style:solid] [border-top-color:var(--color-line)] p-[10px_0]
          text-[12px] [&_p]:text-[#746788] [&_p]:m-[4px_0] [&_p]:text-[11px] public-career`}
                key={i}
              >
                <strong>{c.title}</strong>
                <p>{c.role}</p>
              </div>
            ))}
          </section>
        )}
        <div
          className={`gap-2 mt-6.5 flex
          max-[500px]:flex-wrap [&_button]:text-[12px]
          max-[500px]:[&_button]:min-w-[125px] public-profile-actions`}
        >
          <Action primary onClick={() => onChat(member.id)}>
            메시지 보내기
          </Action>
          {member.status !== '동료' && (
            <Action onClick={() => onConnect(member)}>
              {member.incoming
                ? '요청 수락'
                : member.status === '요청 중'
                  ? '요청 취소'
                  : '＋ 동료 요청'}
            </Action>
          )}
        </div>
        <p className={'text-[#a49ab2] m-[14px_0_0] text-[9px] public-profile-note'}>
          회원이 공개한 정보만 표시됩니다.
        </p>
      </section>
    </Modal>
  );
}
