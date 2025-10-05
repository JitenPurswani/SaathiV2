export function format(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes < 0) return 'Overdue';
      return `In ${minutes} min`;
    }
    if (hours < 0) return 'Overdue';
    return `In ${hours}h`;
  }

  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0) return 'Overdue';
  if (days < 7) return `In ${days} days`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export function parseRelativeDate(input: string): Date | undefined {
  const now = new Date();
  const lowerInput = input.toLowerCase();

  // Relative minutes like: "in 5 min", "5 min mein", "5 मिनट में"
  const minutesPatternA = lowerInput.match(/\b(\d{1,3})\s*(min|mins|minute|minutes|मिनट|मिन)\s*(में|मे|mein)\b/);
  const minutesPatternB = lowerInput.match(/\b(in|after)\s*(\d{1,3})\s*(min|mins|minute|minutes)\b/);
  const minutesPatternC = lowerInput.match(/\b(\d{1,3})\s*(मिनट|मिन)\b/);
  const minutesValue = minutesPatternA ? parseInt(minutesPatternA[1], 10)
    : minutesPatternB ? parseInt(minutesPatternB[2], 10)
    : undefined;
  if (Number.isFinite(minutesValue as number)) {
    const d = new Date(now.getTime() + (minutesValue as number) * 60 * 1000);
    return d;
  }

  // Relative hours like: "in 2 hours", "2 ghante mein", "2 घंटे में"
  const hoursPatternA = lowerInput.match(/\b(\d{1,2})\s*(hour|hours|hrs|घंटे|घंटा|ghante)\s*(में|मे|mein)?\b/);
  const hoursPatternB = lowerInput.match(/\b(in|after)\s*(\d{1,2})\s*(hour|hours|hrs)\b/);
  const hoursValue = hoursPatternA ? parseInt(hoursPatternA[1], 10)
    : hoursPatternB ? parseInt(hoursPatternB[2], 10)
    : undefined;
  if (Number.isFinite(hoursValue as number)) {
    const d = new Date(now.getTime() + (hoursValue as number) * 60 * 60 * 1000);
    return d;
  }

  if (lowerInput.includes('today') || lowerInput.includes('आज')) {
    return now;
  }

  if (lowerInput.includes('tomorrow') || lowerInput.includes('कल')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  // 1) Strict HH:MM (24h) like 18:30
  const hhmm = lowerInput.match(/\b(\d{1,2}):(\d{2})\b/);
  if (hhmm) {
    let hours = parseInt(hhmm[1]);
    const minutes = parseInt(hhmm[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      if (date < now) date.setDate(date.getDate() + 1);
      return date;
    }
  }

  // 2) HH with am/pm or 'बजे' (avoid matching quantities like '4 किलो')
  const timeMatchMeridiem = lowerInput.match(/\b(\d{1,2})\b\s*(am|pm|बजे)\b/i);
  if (timeMatchMeridiem) {
    const numberContext = lowerInput.slice(timeMatchMeridiem.index! - 6, timeMatchMeridiem.index! + 6);
    if (!/(kg|kilo|किलो|liter|लीटर)/i.test(numberContext)) {
      let hours = parseInt(timeMatchMeridiem[1]);
      const minutes = 0;
      const meridiem = timeMatchMeridiem[2]?.toLowerCase();
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      if (date < now) date.setDate(date.getDate() + 1);
      return date;
    }
  }

  return undefined;
}
