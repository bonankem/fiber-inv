import dayjs from "dayjs";
import timeZone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(timeZone);
dayjs.extend(utc);

export function currentTime() {
  return dayjs().tz("Africa/Abidjan");
}

export function currentDate() {
  return currentTime().format("YYYY-MM-DD");
}
