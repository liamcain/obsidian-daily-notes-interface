import * as moment from "moment-timezone";

import getMockApp, { createFile, createFolder } from "src/testUtils/mockApp";

import * as dailyNotesInterface from "../index";
import { setDailyConfig } from "../testUtils/utils";

jest.mock("path");

describe("getDailyNoteSettings", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.existingFiles = {};
    window.moment = moment;
    moment.tz.setDefault("America/New_York");
  });

  test("returns all the daily note settings", () => {
    setDailyConfig({
      folder: "foo",
      format: "YYYY-MM-DD-HHmm",
      template: "template",
    });

    expect(dailyNotesInterface.getDailyNoteSettings()).toEqual({
      folder: "foo",
      format: "YYYY-MM-DD-HHmm",
      template: "template",
    });
  });

  test("cleanses data", () => {
    setDailyConfig({
      folder: " foo/bar ",
      format: "MMM YYYY-MM-DD",
      template: "   path/to/template  ",
    });

    expect(dailyNotesInterface.getDailyNoteSettings()).toEqual({
      folder: "foo/bar",
      format: "MMM YYYY-MM-DD",
      template: "path/to/template",
    });
  });

  test("returns defaults if daily note settings don't exist", () => {
    expect(dailyNotesInterface.getDailyNoteSettings()).toEqual({
      format: "YYYY-MM-DD",
      folder: "",
      template: "",
    });
  });
});

describe("appHasDailyNotesPluginLoaded", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.existingFiles = {};
    window.moment = moment;
  });

  test("returns true when daily notes plugin is enabled", () => {
    // eslint-disable-next-line
    (<any>window.app).internalPlugins.plugins["daily-notes"].enabled = true;

    expect(dailyNotesInterface.appHasDailyNotesPluginLoaded()).toEqual(true);
  });

  test("returns true when daily notes plugin is enabled", () => {
    // eslint-disable-next-line
    (<any>window.app).internalPlugins.plugins["daily-notes"].enabled = false;

    expect(dailyNotesInterface.appHasDailyNotesPluginLoaded()).toEqual(false);
  });
});

describe("getAllDailyNotes", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment;
    window.existingFiles = {};
  });

  test("throws error if daily note folder can't be found", () => {
    setDailyConfig({
      folder: "missing-folder/",
      format: "YYYY-MM-DD",
      template: "template",
    });

    expect(dailyNotesInterface.getAllDailyNotes).toThrow(
      "Failed to find daily notes folder"
    );
  });

  test("returns a list of all daily notes with no nested folders", () => {
    setDailyConfig({
      folder: "/",
      format: "YYYY-MM-DD",
      template: "template",
    });

    const fileA = createFile("2020-12-01", "");
    const fileB = createFile("2020-12-02", "");
    const fileC = createFile("2020-12-03", "");
    createFolder("/", [fileA, fileB, fileC]);

    expect(dailyNotesInterface.getAllDailyNotes()).toEqual({
      "day-2020-12-01T00:00:00-05:00": fileA,
      "day-2020-12-02T00:00:00-05:00": fileB,
      "day-2020-12-03T00:00:00-05:00": fileC,
    });
  });

  test("returns a list of all daily notes including files nested in folders", () => {
    setDailyConfig({
      folder: "/",
      format: "YYYY-MM-DD",
      template: "template",
    });

    const fileA = createFile("2020-12-01", "");
    const fileB = createFile("2020-12-02", "");
    const fileC = createFile("2020-12-03", "");
    createFolder("/", [fileA, fileB, createFolder("foo", [fileC])]);

    expect(dailyNotesInterface.getAllDailyNotes()).toEqual({
      "day-2020-12-01T00:00:00-05:00": fileA,
      "day-2020-12-02T00:00:00-05:00": fileB,
      "day-2020-12-03T00:00:00-05:00": fileC,
    });
  });
});
