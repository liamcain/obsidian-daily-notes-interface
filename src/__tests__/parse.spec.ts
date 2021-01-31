import * as moment from "moment-timezone";

import * as dailyNotesInterface from "../index";

jest.mock("path");

describe("getDateUID", () => {
  beforeAll(() => {
    window.moment = moment;
    moment.tz.setDefault("America/New_York");
  });

  test("it does not mutate the original date", () => {
    const date = moment("2021-01-05T04:12:21-05:00");
    const clonedDate = date.clone();

    dailyNotesInterface.getDateUID(date);

    expect(date.isSame(clonedDate)).toEqual(true);
  });

  test("it uses 'day' for the default granularity", () => {
    const date = moment("2021-01-05T04:12:21-05:00");
    expect(dailyNotesInterface.getDateUID(date)).toEqual(
      "day-2021-01-05T00:00:00-05:00"
    );
  });

  test("it supports 'week' granularity", () => {
    const date = moment("2021-01-05T04:12:21-05:00");
    expect(dailyNotesInterface.getDateUID(date, "week")).toEqual(
      "week-2021-01-03T00:00:00-05:00"
    );
  });

  test("it supports 'month' granularity", () => {
    const date = moment("2021-01-05T04:12:21-05:00");
    expect(dailyNotesInterface.getDateUID(date, "month")).toEqual(
      "month-2021-01-01T00:00:00-05:00"
    );
  });
});
