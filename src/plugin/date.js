// timestamp default = utc +0 (number)
export default function date(timestamp = Date.now() + new Date().getTimezoneOffset() * 60 * 1000) {
  // server return utc +0 time, get user's local time add change to user's local time
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(timestamp + offset).toISOString().slice(0, 19).replace('T', ' ');
}