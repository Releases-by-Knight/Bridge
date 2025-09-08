export function getNptTimestamp(): string {
  const now = new Date();
  // UTC time in milliseconds
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  // Nepal offset: +5:45 = 5*60 + 45 = 345 minutes
  const nptMs = utcMs + 345 * 60 * 1000;
  const npt = new Date(nptMs);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = npt.getFullYear();
  const month = pad(npt.getMonth() + 1);
  const day = pad(npt.getDate());
  const hours = pad(npt.getHours());
  const minutes = pad(npt.getMinutes());
  const seconds = pad(npt.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
