import * as moment from "moment-timezone";

import getMockApp, { createFile, createFolder } from "src/testUtils/mockApp";

import * as dailyNotesInterface from "../index";
import { setYearlyConfig } from "../testUtils/utils";
import * as vaultUtils from "../vault";

jest.mock("path");

moment.tz.setDefault("America/New_York");

describe("getYearlyNoteSettings", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.existingFiles = {};
    window.moment = moment;
  });

  test("returns all the yearly note settings", () => {
    setYearlyConfig({
      enabled: true,
      folder: "foo",
      format: "YYYY",
      template: "template",
    });

    expect(dailyNotesInterface.getYearlyNoteSettings()).toEqual({
      folder: "foo",
      format: "YYYY",
      template: "template",
    });
  });

  test("cleanses data", () => {
    setYearlyConfig({
      enabled: true,
      folder: " foo/bar ",
      format: "YYYY",
      template: "   path/to/template  ",
    });

    expect(dailyNotesInterface.getYearlyNoteSettings()).toEqual({
      folder: "foo/bar",
      format: "YYYY",
      template: "path/to/template",
    });
  });

  test("returns defaults if yearly note settings don't exist", () => {
    expect(dailyNotesInterface.getYearlyNoteSettings()).toEqual({
      format: "YYYY",
      folder: "",
      template: "",
    });
  });
});

describe("appHasYearlyNotesPluginLoaded", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.existingFiles = {};
    window.moment = moment;
  });

  test("returns true when periodic-notes plugin is enabled", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = (<any>window.app).plugins.plugins["periodic-notes"];
    periodicNotes._loaded = true;
    periodicNotes.settings.yearly.enabled = true;

    expect(dailyNotesInterface.appHasYearlyNotesPluginLoaded()).toEqual(true);
  });

  test("returns false when periodic-notes plugin is enabled and weekly is disabled", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = (<any>window.app).plugins.plugins["periodic-notes"];

    periodicNotes._loaded = true;
    periodicNotes.settings.yearly.enabled = false;

    expect(dailyNotesInterface.appHasYearlyNotesPluginLoaded()).toEqual(false);
  });

  test("returns false when periodic-notes plugin is disabled", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = (<any>window.app).plugins.plugins["periodic-notes"];

    periodicNotes._loaded = false;
    periodicNotes.settings.yearly.enabled = false;

    expect(dailyNotesInterface.appHasYearlyNotesPluginLoaded()).toEqual(false);
  });
});

describe("getAllYearlyNotes", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment;
    window.existingFiles = {};
  });

  test("throws error if yearly note folder can't be found", () => {
    setYearlyConfig({
      enabled: true,
      folder: "missing-folder/",
      format: "YYYY",
      template: "template",
    });

    expect(dailyNotesInterface.getAllYearlyNotes).toThrow(
      "Failed to find yearly notes folder"
    );
  });

  test("returns a list of all yearly notes with no nested folders", () => {
    setYearlyConfig({
      enabled: true,
      folder: "/",
      format: "YYYY",
      template: "template",
    });

    const fileA = createFile("2020", "");
    const fileB = createFile("2021", "");
    const fileC = createFile("2022", "");
    createFolder("/", [fileA, fileB, fileC]);

    expect(dailyNotesInterface.getAllYearlyNotes()).toEqual({
      "year-2020-01-01T00:00:00-05:00": fileA,
      "year-2021-01-01T00:00:00-05:00": fileB,
      "year-2022-01-01T00:00:00-05:00": fileC,
    });
  });

  test("returns a list of all yearly notes including files nested in folders", () => {
    setYearlyConfig({
      enabled: true,
      folder: "/",
      format: "YYYY",
      template: "template",
    });

    const fileA = createFile("2020", "");
    const fileB = createFile("2021", "");
    const fileC = createFile("2022", "");
    createFolder("/", [fileA, fileB, createFolder("foo", [fileC])]);

    expect(dailyNotesInterface.getAllYearlyNotes()).toEqual({
      "year-2020-01-01T00:00:00-05:00": fileA,
      "year-2021-01-01T00:00:00-05:00": fileB,
      "year-2022-01-01T00:00:00-05:00": fileC,
    });
  });
});

describe("getYearlyNote", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment;
    window.existingFiles = {};
  });

  test("returns note on the same year even if the HH:mm:SS is different", () => {
    setYearlyConfig({
      enabled: true,
      folder: "/",
      format: "YYYY-HHmm",
      template: "template",
    });

    const fileA = createFile("2021-0408", "");

    expect(
      dailyNotesInterface.getYearlyNote(
        moment("2021-01-0745", "YYYY-MM-HHmm", true),
        {
          "year-2021-01-01T00:00:00-05:00": fileA,
        }
      )
    ).toEqual(fileA);
  });

  test("returns null if there is no yearly note for a given date", () => {
    setYearlyConfig({
      enabled: true,
      folder: "/",
      format: "YYYY-ww",
    });

    const fileA = createFile("2020-01", "");

    expect(
      dailyNotesInterface.getYearlyNote(moment("2020-01", "YYYY-ww", true), {
        "2020-12": fileA,
      })
    ).toEqual(null);
  });
});

describe("createYearlyNote", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment;
    window.existingFiles = {};
  });

  test("uses folder path from yearly note settings", async () => {
    setYearlyConfig({
      enabled: true,
      folder: "/yearly-notes",
      format: "YYYY",
    });

    const date = moment("2020-10", "YYYY-MM", true);
    await dailyNotesInterface.createYearlyNote(date);

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/yearly-notes/2020.md",
      ""
    );
  });

  test("uses template contents when creating file", async () => {
    setYearlyConfig({
      enabled: true,
      folder: "/yearly-notes",
      format: "YYYY",
      template: "template",
    });

    createFile("template", "template contents");

    const date = moment("2020-10", "YYYY-MM", true);
    await dailyNotesInterface.createYearlyNote(date);

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/yearly-notes/2020.md",
      "template contents"
    );
  });

  test("shows error if file creation failed", async () => {
    const createFn = window.app.vault.create;
    (createFn as jest.MockedFunction<typeof createFn>).mockRejectedValue(
      "error"
    );
    jest.spyOn(global.console, "error").mockImplementation();

    setYearlyConfig({
      enabled: true,
      folder: "/yearly-notes",
      format: "YYYY",
      template: "template",
    });
    const date = moment("2020-10", "YYYY-MM", true);

    await dailyNotesInterface.createYearlyNote(date);

    expect(console.error).toHaveBeenCalledWith(
      "Failed to create file: '/yearly-notes/2020.md'",
      "error"
    );
  });
});

describe("createYearlyNote", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment.bind(null, "2021-02-15T14:06:00-05:00");
    moment.tz.setDefault("America/New_York");
  });

  test("replaces all mustaches in template", async () => {
    const getTemplateInfo = jest.spyOn(vaultUtils, "getTemplateInfo");
    getTemplateInfo.mockResolvedValue([
      `
{{date}}
{{time}}
{{title}}
{{date:YYYY}} {{date:MMMM}}
{{date+2d:YYYY-MM-DD}}
{{date+1M:YYYY-MM-DD}}
{{date+10y:YYYY-MM-DD}}
{{date +1M}}
`,
      null,
    ]);

    setYearlyConfig({
      enabled: true,
      folder: "/",
      format: "YYYY",
      template: "template",
    });

    await dailyNotesInterface.createYearlyNote(window.moment());

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/2021.md",
      `
2021
2021
2021
2021 February
2021-02-17
2021-03-15
2031-02-15
2021
`
    );
  });
});
