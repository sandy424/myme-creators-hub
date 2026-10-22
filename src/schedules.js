// Replace this fixture provider with the schedule API when it becomes available.
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function recruitmentStatus(event, today = dateKey(new Date())) {
  if (today < event.recruitmentStart) return '모집 예정';
  if (today > event.recruitmentEnd) return '마감';
  const deadline = new Date(`${event.recruitmentEnd}T00:00:00`);
  const now = new Date(`${today}T00:00:00`);
  return (deadline - now) / 86400000 <= 3 ? '마감 임박' : '모집 중';
}

export function filterSchedules(events, { start, end, type = '전체', recruiting = false, today }) {
  return events
    .filter((event) => event.startDate <= end && event.endDate >= start)
    .filter((event) => type === '전체' || event.type === type)
    .filter(
      (event) => !recruiting || ['모집 중', '마감 임박'].includes(recruitmentStatus(event, today)),
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id));
}

export function createExampleSchedules(now = new Date()) {
  const y = now.getFullYear(),
    m = now.getMonth();
  const date = (day, offset = 0) =>
    dateKey(new Date(y, m + offset, Math.min(day, new Date(y, m + offset + 1, 0).getDate())));
  return [
    [
      'class',
      'AI 게임 제작 원데이 클래스',
      '교육',
      24,
      24,
      '14:00 – 17:00',
      '온라인 · Zoom',
      1,
      27,
      '아이디어를 간단한 게임으로 구현해 보는 입문 클래스입니다. 기획부터 프로토타입 제작까지 함께 실습합니다.',
    ],
    [
      'meetup',
      '인디게임 크리에이터 밋업',
      '행사',
      26,
      26,
      '19:00 – 21:00',
      '서울 · 크리에이터 라운지',
      1,
      28,
      '개발 중인 게임을 소개하고 동료 창작자와 피드백을 나누는 네트워킹 행사입니다.',
    ],
    [
      'workshop',
      '게임 기획 포트폴리오 워크숍',
      '교육',
      29,
      29,
      '14:00 – 18:00',
      '온라인',
      1,
      24,
      '게임 기획서를 함께 살펴보고 나만의 포트폴리오를 다듬습니다. 작업 중인 기획서를 준비해 주세요.',
    ],
    [
      'jam',
      '주말 미니 게임잼',
      '행사',
      31,
      2,
      '첫날 10:00 시작 · 마지막 날 18:00 종료',
      '온라인 · Discord',
      25,
      30,
      '서로 다른 세계의 창작자들이 팀을 이뤄 작은 게임을 만듭니다. 개인 또는 팀으로 참여할 수 있습니다.',
    ],
    [
      'sound',
      '게임 사운드 디자인 입문',
      '교육',
      12,
      12,
      '13:00 – 16:00',
      '부산 · 창작 스튜디오',
      1,
      10,
      '효과음과 배경 음악으로 게임의 분위기를 설계하는 방법을 배웁니다.',
    ],
    [
      'showcase',
      '월간 플레이테스트 데이',
      '행사',
      18,
      20,
      '매일 13:00 – 18:00',
      '온라인',
      1,
      16,
      '다양한 인디게임을 플레이하고 개발자에게 의견을 전하는 공개 테스트입니다.',
    ],
  ].map(([id, title, type, start, end, time, location, from, until, description]) => ({
    id,
    title,
    type,
    startDate: date(start),
    endDate: date(end, id === 'jam' ? 1 : 0),
    time,
    location,
    recruitmentStart: date(from),
    recruitmentEnd: date(until),
    description,
    poster: `/posters/${id}.svg`,
    applicationUrl: `https://example.com/myme/${id}`,
  }));
}
