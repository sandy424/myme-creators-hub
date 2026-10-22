import test from 'node:test';
import assert from 'node:assert/strict';
import { filterSchedules, recruitmentStatus, createExampleSchedules } from '../src/schedules.js';

const event = {
  id: 'span',
  type: '행사',
  startDate: '2026-10-31',
  endDate: '2026-11-02',
  recruitmentStart: '2026-10-20',
  recruitmentEnd: '2026-10-30',
};
test('schedule filtering includes overlapping months and every day of a multi-day event', () => {
  for (const [start, end] of [
    ['2026-10-01', '2026-10-31'],
    ['2026-11-01', '2026-11-30'],
    ['2026-11-02', '2026-11-02'],
  ]) {
    assert.deepEqual(filterSchedules([event], { start, end }), [event]);
  }
  assert.deepEqual(filterSchedules([event], { start: '2026-11-03', end: '2026-11-03' }), []);
});
test('type and recruitment filters combine, with inclusive recruitment boundaries', () => {
  const base = { start: '2026-10-01', end: '2026-10-31', recruiting: true };
  assert.equal(recruitmentStatus(event, '2026-10-19'), '모집 예정');
  assert.equal(recruitmentStatus(event, '2026-10-20'), '모집 중');
  assert.equal(recruitmentStatus(event, '2026-10-27'), '마감 임박');
  assert.equal(recruitmentStatus(event, '2026-10-30'), '마감 임박');
  assert.equal(recruitmentStatus(event, '2026-10-31'), '마감');
  assert.equal(filterSchedules([event], { ...base, type: '행사', today: '2026-10-30' }).length, 1);
  assert.equal(filterSchedules([event], { ...base, type: '교육', today: '2026-10-30' }).length, 0);
  assert.equal(filterSchedules([event], { ...base, today: '2026-10-31' }).length, 0);
});
test('example data remains valid in short months and across year boundaries', () => {
  for (const now of [new Date(2026, 1, 1), new Date(2026, 11, 1)]) {
    const events = createExampleSchedules(now);
    assert.equal(new Set(events.map((entry) => entry.id)).size, events.length);
    for (const entry of events) assert(entry.startDate <= entry.endDate);
  }
});
