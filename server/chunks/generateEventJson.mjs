import { defineEventHandler, readBody } from 'h3';
import fs from 'fs';
import path from 'path';
import { dump } from 'js-yaml';

var Weekday = /* @__PURE__ */ ((Weekday2) => {
  Weekday2["Sunday"] = "0";
  Weekday2["Monday"] = "1";
  Weekday2["Tuesday"] = "2";
  Weekday2["Wednesday"] = "3";
  Weekday2["Thursday"] = "4";
  Weekday2["Friday"] = "5";
  Weekday2["Saturday"] = "6";
  return Weekday2;
})(Weekday || {});
var AWSWeekday = /* @__PURE__ */ ((AWSWeekday2) => {
  AWSWeekday2["Sunday"] = "1";
  AWSWeekday2["Monday"] = "2";
  AWSWeekday2["Tuesday"] = "3";
  AWSWeekday2["Wednesday"] = "4";
  AWSWeekday2["Thursday"] = "5";
  AWSWeekday2["Friday"] = "6";
  AWSWeekday2["Saturday"] = "7";
  return AWSWeekday2;
})(AWSWeekday || {});

const JST_TZ_OFFSET = 9;
const weekdayMappings = [
  { code: Number(Weekday.Sunday), awsCode: Number(AWSWeekday.Sunday) },
  { code: Number(Weekday.Monday), awsCode: Number(AWSWeekday.Monday) },
  { code: Number(Weekday.Tuesday), awsCode: Number(AWSWeekday.Tuesday) },
  { code: Number(Weekday.Wednesday), awsCode: Number(AWSWeekday.Wednesday) },
  { code: Number(Weekday.Thursday), awsCode: Number(AWSWeekday.Thursday) },
  { code: Number(Weekday.Friday), awsCode: Number(AWSWeekday.Friday) },
  { code: Number(Weekday.Saturday), awsCode: Number(AWSWeekday.Saturday) }
];
const generateEventJson = defineEventHandler(async (req) => {
  const events = await readBody(req);
  const schedules = events.map((event) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const eventTime = event.eventTime ? new Date(event.eventTime) : null;
    return {
      resourceType: (_b = (_a = event.resourceType) == null ? void 0 : _a.code) != null ? _b : null,
      resourceId: (_d = (_c = event.resourceId) == null ? void 0 : _c.code) != null ? _d : null,
      eventType: (_f = (_e = event.eventType) == null ? void 0 : _e.code) != null ? _f : null,
      eventHour: eventTime ? eventTime.getHours() : null,
      eventMinute: eventTime ? eventTime.getMinutes() : null,
      weekdays: (_g = event.weekdays) == null ? void 0 : _g.map(Number).sort(),
      holiday: (_i = (_h = event.holiday) == null ? void 0 : _h.code) != null ? _i : null,
      memo: (_j = event.memo) != null ? _j : null
    };
  }).filter(
    (data) => data.resourceType !== null && data.resourceId !== null && data.eventType !== null && data.eventHour !== null && data.eventMinute !== null && data.weekdays !== null
  );
  const eventJsonItem = {
    schedules
  };
  let eventJsonStatus = true;
  fs.writeFile(
    path.join(process.cwd(), "..", "serverless", "config", "event.json"),
    JSON.stringify(eventJsonItem, null, 2),
    (err) => {
      if (err) {
        eventJsonStatus = false;
      }
    }
  );
  const eventSchedules = [];
  const eventSchedule = {
    schedule: {
      rate: [],
      input: "${file(./config/event.json)}"
    }
  };
  schedules.forEach((schedule) => {
    const tmpDate = /* @__PURE__ */ new Date();
    tmpDate.setHours(schedule.eventHour - JST_TZ_OFFSET, schedule.eventMinute, 0, 0);
    const awsWeekdays = schedule.weekdays.map(
      (weekday) => {
        var _a;
        return (_a = weekdayMappings.find((mapping) => mapping.code === weekday)) == null ? void 0 : _a.awsCode;
      }
    );
    const cronRate = `cron(${schedule.eventMinute} ${tmpDate.getHours()} ? * ${awsWeekdays == null ? void 0 : awsWeekdays.join(",")} *)`;
    if (eventSchedule.schedule.rate.find((rate) => rate === cronRate)) {
      return;
    }
    eventSchedule.schedule.rate.push(cronRate);
  });
  eventSchedules.push(eventSchedule);
  let scheduleYmlStatus = true;
  const scheduleYmlData = dump(eventSchedules);
  fs.writeFile(path.join(process.cwd(), "..", "serverless", "config", "schedule.yml"), scheduleYmlData, (err) => {
    if (err) {
      scheduleYmlStatus = false;
    }
  });
  return {
    eventJsonStatus,
    eventJsonData: eventJsonItem,
    scheduleYmlStatus,
    scheduleYmlData
  };
});

export { generateEventJson as default, weekdayMappings };
//# sourceMappingURL=generateEventJson.mjs.map
