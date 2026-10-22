import { useId, useMemo, useState } from 'react';
const displayNames = new Intl.DisplayNames(['ko'], { type: 'region' });
export const countries = (() => {
  const result = [];
  for (let a = 65; a <= 90; a++)
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b),
        name = displayNames.of(code);
      if (name !== code && !['EU', 'EZ', 'UN', 'QO', 'XA', 'XB', 'ZZ'].includes(code))
        result.push({ code, name });
    }
  return result.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
})();
export const exactCountry = (value) =>
  countries.find((c) => c.name.normalize('NFC') === value.trim().normalize('NFC'))?.name || '';
export default function CountrySelect({ value, onChange }) {
  const id = useId(),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const matches = useMemo(() => countries.filter((c) => c.name.includes(value.trim())), [value]);
  function choose(name) {
    onChange(name);
    setOpen(false);
    setActive(-1);
  }
  return (
    <div
      className={`min-w-0
          [.auth-dialog_&_input[type='hidden']]:hidden [&_>_small]:text-[#746788] [&_>_small]:mt-[5px]
          [&_>_small]:text-[12px] [&_>_small]:leading-[1.5] [&_>_small]:block
          [.auth-dialog_.signup-grid_&_input]:mt-1
          [.profile-dialog_&]:mt-4 signup-country`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
          if (exactCountry(value)) onChange(exactCountry(value));
        }
      }}
    >
      <label htmlFor={id}>활동 국가</label>
      <input
        id={id}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={id + '-list'}
        aria-activedescendant={open && active >= 0 ? id + '-option-' + active : undefined}
        placeholder="국가명 검색 · 예: 대한민국"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
            setActive((i) =>
              matches.length
                ? (i + (e.key === 'ArrowDown' ? 1 : matches.length - 1) + matches.length) %
                  matches.length
                : -1,
            );
          } else if (e.key === 'Enter' && open) {
            e.preventDefault();
            if (matches[active] || matches.length === 1)
              choose((matches[active] || matches[0]).name);
          }
        }}
      />
      {open && (
        <div
          className={`bg-white [border-width:1px] [border-style:solid] [border-color:#d5d0dc] rounded-[10px]
          max-h-40 mt-[5px] p-1 overflow-y-auto [&[hidden]]:hidden [&_button]:text-left
          [&_button]:text-[#423a4e] [&_button]:[background:0_0] [&_button]:[border-width:0]
          [&_button]:[border-style:none] [&_button]:[border-color:currentColor] [&_button]:rounded-[6px]
          [&_button]:w-full [&_button]:p-[8px_10px] [&_button]:text-[16px] [&_button]:font-[500]
          [&_button]:block [&_button:hover]:text-[#743ac8] [&_button:hover]:[background:#f6f6f7]
          [&_button[aria-selected='true']]:text-[#743ac8] [&_button[aria-selected='true']]:[background:#efeef1]
          [&_button[aria-selected='true']]:font-[600] [&_p]:text-[#746788] [&_p]:p-2 [&_p]:text-[14px]
          [.auth-dialog_&_button]:min-h-0 signup-country-list`}
          id={id + '-list'}
          role="listbox"
          aria-label="가나다순 활동 국가"
        >
          {matches.map((country, i) => (
            <button
              type="button"
              role="option"
              aria-selected={value === country.name}
              className={
                active === i
                  ? `[.signup-country-list_button&]:text-[#743ac8]
          [.signup-country-list_button&]:[background:#f6f6f7] keyboard-active`
                  : ''
              }
              id={id + '-option-' + i}
              key={country.code}
              onClick={() => choose(country.name)}
            >
              {country.name}
            </button>
          ))}
          {!matches.length && <p>검색 결과가 없습니다.</p>}
        </div>
      )}
      <small role="status">
        {exactCountry(value)
          ? '선택: ' + exactCountry(value)
          : open
            ? matches.length + '개 국가 · 가나다순'
            : '국가명을 입력해 검색하세요.'}
      </small>
    </div>
  );
}
