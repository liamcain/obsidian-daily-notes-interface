import * as moment from "moment-timezone";
import getMockApp, { createFile } from "src/testUtils/mockApp";

import * as dailyNotesInterface from "../index";
import {
  setDailyConfig,
  setMonthlyConfig,
  setWeeklyConfig,
} from "../testUtils/utils";

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

describe("getDateFromFile", () => {
  beforeAll(() => {
    window.moment = moment;
    window.app = getMockApp();
    moment.tz.setDefault("America/New_York");
  });

  test("it supports 'month' granularity", () => {
    setMonthlyConfig({
      format: "YYYY-MM",
    });

    const file = createFile("2021-01", "");
    expect(dailyNotesInterface.getDateFromFile(file, "month").format()).toEqual(
      "2021-01-01T00:00:00-05:00"
    );
  });

  test("it supports 'daily' granularity", () => {
    setDailyConfig({
      format: "YYYY-MM-DD",
    });

    const file = createFile("2021-01-03", "");
    expect(dailyNotesInterface.getDateFromFile(file, "day").format()).toEqual(
      "2021-01-03T00:00:00-05:00"
    );
  });

  describe("weekly granularity", () => {
    test("it supports formats with year and month", () => {
      setWeeklyConfig({ format: "gggg-MM" });
      const file = createFile("2021-07", "");

      expect(
        dailyNotesInterface.getDateFromFile(file, "week").format()
      ).toEqual("2021-07-01T00:00:00-04:00");
    });

    test("it supports formats with year, month, and day", () => {
      setWeeklyConfig({ format: "gggg-MM-DD" });
      const file = createFile("2021-07-11", "");

      expect(
        dailyNotesInterface.getDateFromFile(file, "week").format()
      ).toEqual("2021-07-11T00:00:00-04:00");
    });

    test("it supports formats with partial year, month, and week number", () => {
      setWeeklyConfig({ format: "21MM[W]ww" });
      const file = createFile("2107W07", "");

      expect(
        dailyNotesInterface.getDateFromFile(file, "week").format()
      ).toEqual("2021-02-07T00:00:00-05:00");
    });

    test("it supports formats with year and week number", () => {
      setWeeklyConfig({ format: "gggg-[W]ww" });
      const file = createFile("2021-W07", "");

      expect(
        dailyNotesInterface.getDateFromFile(file, "week").format()
      ).toEqual("2021-02-07T00:00:00-05:00");
    });

    test("it supports formats with year, week number, and month", () => {
      setWeeklyConfig({ format: "gggg-[W]ww-MMM" });
      const file = createFile("2021-W07-Feb", "");

      expect(
        dailyNotesInterface.getDateFromFile(file, "week").format()
      ).toEqual("2021-02-07T00:00:00-05:00");
    });

    test("it supports formats with year, week number, and day", () => {
      setWeeklyConfig({ format: "gggg-[W]ww-DD" });
      const file = createFile("2021-W07-07", "");

      expect(
        dailyNotesInterface.getDateFromFile(file, "week").format()
      ).toEqual("2021-02-07T00:00:00-05:00");
    });

    test("it supports formats with year, month number, week number", () => {
      setWeeklyConfig({ format: "gggg-MM-[W]ww" });
      const file = createFile("2021-02-W07", "");

      expect(
        dailyNotesInterface.getDateFromFile(file, "week").format()
      ).toEqual("2021-02-07T00:00:00-05:00");
    });

    test("it supports formats with year, month number, week number without prefix", () => {
      setWeeklyConfig({ format: "gggg-MM-ww" });
      const file = createFile("2021-02-07", "");

      expect(
        dailyNotesInterface.getDateFromFile(file, "week").format()
      ).toEqual("2021-02-07T00:00:00-05:00");
    });

    test("it supports year, month, day, week number", () => {
      setWeeklyConfig({ format: "gggg-MM-DD_[W]ww" });
      const file = createFile("2021-02-07_W07", "");

      expect(
        dailyNotesInterface.getDateFromFile(file, "week").format()
      ).toEqual("2021-02-07T00:00:00-05:00");
    });

    test("ambiguous dates are still parsed strictly first", () => {
      setWeeklyConfig({ format: "gggg-MM-[W]ww" });

      const fileWithSuffix = createFile("2021-02-W07 Foo", "");
      const fileWithSpaces = createFile("2021 02 W07", "");

      expect(
        dailyNotesInterface.getDateFromFile(fileWithSuffix, "week")
      ).toBeNull();
      expect(
        dailyNotesInterface.getDateFromFile(fileWithSpaces, "week")
      ).toBeNull();
    });
  });
});
