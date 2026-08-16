export const ACTIVITY_PERIODS = {
  '1w': { label: 'Last 1 Week', days: 7 },
  '2w': { label: 'Last 2 Weeks', days: 14 },
  '3w': { label: 'Last 3 Weeks', days: 21 }
};

const SEED_TIMESTAMPS = {
  1: '2026-08-12T07:05:00',
  2: '2026-08-12T08:30:00',
  3: '2026-08-12T06:32:00',
  4: '2026-08-12T08:15:00',
  5: '2026-08-12T08:00:00',
  6: '2026-08-12T04:42:00',
  7: '2026-08-12T06:00:00',
  8: '2026-08-12T00:00:00',
  9: '2026-08-10T11:15:00',
  10: '2026-08-09T16:20:00',
  11: '2026-08-05T09:42:00',
  12: '2026-08-01T14:30:00',
  13: '2026-07-28T08:15:00'
};

function parseTimeOnlyToday(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function getActivityTimestamp(log) {
  if (log.timestamp) {
    const parsed = new Date(log.timestamp);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (SEED_TIMESTAMPS[log.id]) {
    return new Date(SEED_TIMESTAMPS[log.id]);
  }

  if (typeof log.id === 'number' && log.id > 1_700_000_000_000) {
    return new Date(log.id);
  }

  const fromTime = parseTimeOnlyToday(log.time);
  if (fromTime) return fromTime;

  return new Date(0);
}

export function filterActivityByPeriod(logs, periodKey) {
  const period = ACTIVITY_PERIODS[periodKey] || ACTIVITY_PERIODS['1w'];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - period.days);
  cutoff.setHours(0, 0, 0, 0);

  return logs.filter(log => getActivityTimestamp(log) >= cutoff);
}

export function formatActivityDateTime(log) {
  const date = getActivityTimestamp(log);
  if (date.getTime() <= 0) return log.time || '—';
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getPeriodLabel(periodKey) {
  return ACTIVITY_PERIODS[periodKey]?.label || ACTIVITY_PERIODS['1w'].label;
}
