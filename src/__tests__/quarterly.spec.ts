import * as moment from "moment-timezone";

import getMockApp, { createFile, createFolder } from "src/testUtils/mockApp";

import * as dailyNotesInterface from "../index";
import { setQuarterlyConfig } from "../testUtils/utils";
import * as vaultUtils from "../vault";

jest.mock("path");

moment.tz.setDefault("America/New_York");

describe("getQuarterlyNoteSettings", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.existingFiles = {};
    window.moment = moment;
  });

  test("returns all the quarterly note settings", () => {
    setQuarterlyConfig({
      enabled: true,
      folder: "foo",
      format: "YYYY-[Q]Q",
      template: "template",
    });

    expect(dailyNotesInterface.getQuarterlyNoteSettings()).toEqual({
      folder: "foo",
      format: "YYYY-[Q]Q",
      template: "template",
    });
  });

  test("cleanses data", () => {
    setQuarterlyConfig({
      enabled: true,
      folder: " foo/bar ",
      format: "YYYY-[Q]Q",
      template: "   path/to/template  ",
    });

    expect(dailyNotesInterface.getQuarterlyNoteSettings()).toEqual({
      folder: "foo/bar",
      format: "YYYY-[Q]Q",
      template: "path/to/template",
    });
  });

  test("returns defaults if quarterly note settings don't exist", () => {
    expect(dailyNotesInterface.getQuarterlyNoteSettings()).toEqual({
      format: "YYYY-[Q]Q",
      folder: "",
      template: "",
    });
  });
});

describe("appHasQuarterlyNotesPluginLoaded", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.existingFiles = {};
    window.moment = moment;
  });

  test("returns true when periodic-notes plugin is enabled", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = (<any>window.app).plugins.plugins["periodic-notes"];
    periodicNotes._loaded = true;
    periodicNotes.settings.quarterly.enabled = true;

    expect(dailyNotesInterface.appHasQuarterlyNotesPluginLoaded()).toEqual(
      true
    );
  });

  test("returns false when periodic-notes plugin is enabled and weekly is disabled", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = (<any>window.app).plugins.plugins["periodic-notes"];

    periodicNotes._loaded = true;
    periodicNotes.settings.quarterly.enabled = false;

    expect(dailyNotesInterface.appHasQuarterlyNotesPluginLoaded()).toEqual(
      false
    );
  });

  test("returns false when periodic-notes plugin is disabled", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = (<any>window.app).plugins.plugins["periodic-notes"];

    periodicNotes._loaded = false;
    periodicNotes.settings.quarterly.enabled = false;

    expect(dailyNotesInterface.appHasQuarterlyNotesPluginLoaded()).toEqual(
      false
    );
  });
});

describe("getAllQuarterlyNotes", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment;
    window.existingFiles = {};
  });

  test("throws error if quarterly note folder can't be found", () => {
    setQuarterlyConfig({
      enabled: true,
      folder: "missing-folder/",
      format: "YYYY-[Q]Q",
      template: "template",
    });

    expect(dailyNotesInterface.getAllQuarterlyNotes).toThrow(
      "Failed to find quarterly notes folder"
    );
  });

  test("returns a list of all quarterly notes with no nested folders", () => {
    setQuarterlyConfig({
      enabled: true,
      folder: "/",
      format: "YYYY-[Q]Q",
      template: "template",
    });

    const fileA = createFile("2021-Q1", "");
    const fileB = createFile("2021-Q2", "");
    const fileC = createFile("2021-Q3", "");
    createFolder("/", [fileA, fileB, fileC]);

    expect(dailyNotesInterface.getAllQuarterlyNotes()).toEqual({
      "quarter-2021-01-01T00:00:00-05:00": fileA,
      "quarter-2021-04-01T00:00:00-04:00": fileB,
      "quarter-2021-07-01T00:00:00-04:00": fileC,
    });
  });

  test("returns a list of all quarterly notes including files nested in folders", () => {
    setQuarterlyConfig({
      enabled: true,
      folder: "/",
      format: "YYYY-[Q]Q",
      template: "template",
    });

    const fileA = createFile("2021-Q1", "");
    const fileB = createFile("2021-Q2", "");
    const fileC = createFile("2021-Q3", "");
    createFolder("/", [fileA, fileB, createFolder("foo", [fileC])]);

    expect(dailyNotesInterface.getAllQuarterlyNotes()).toEqual({
      "quarter-2021-01-01T00:00:00-05:00": fileA,
      "quarter-2021-04-01T00:00:00-04:00": fileB,
      "quarter-2021-07-01T00:00:00-04:00": fileC,
    });
  });
});

describe("getQuarterlyNote", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment;
    window.existingFiles = {};
  });

  test("returns note on the same day even if the HH:MM:SS is different", () => {
    setQuarterlyConfig({
      enabled: true,
      folder: "/",
      format: "YYYY-MM-HHmm",
      template: "template",
    });

    const fileA = createFile("2020-02-0408", "");

    expect(
      dailyNotesInterface.getQuarterlyNote(
        moment("2021-02-0745", "YYYY-MM-HHmm", true),
        {
          "quarter-2021-01-01T00:00:00-05:00": fileA,
        }
      )
    ).toEqual(fileA);
  });

  test("returns null if there is no quarterly note for a given date", () => {
    setQuarterlyConfig({
      enabled: true,
      folder: "/",
      format: "YYYY-ww",
    });

    const fileA = createFile("2020-01", "");

    expect(
      dailyNotesInterface.getQuarterlyNote(moment("2020-01", "YYYY-ww", true), {
        "2020-12": fileA,
      })
    ).toEqual(null);
  });
});

describe("createQuarterlyNote", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment;
    window.existingFiles = {};
  });

  test("uses folder path from quarterly note settings", async () => {
    setQuarterlyConfig({
      enabled: true,
      folder: "/quarterly-notes",
      format: "YYYY-[Q]Q",
    });

    const date = moment("2020-Q4", "YYYY-[Q]Q", true);
    await dailyNotesInterface.createQuarterlyNote(date);

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/quarterly-notes/2020-Q4.md",
      ""
    );
  });

  test("uses template contents when creating file", async () => {
    setQuarterlyConfig({
      enabled: true,
      folder: "/quarterly-notes",
      format: "YYYY-[Q]Q",
      template: "template",
    });

    createFile("template", "template contents");

    const date = moment("2020-Q4", "YYYY-[Q]Q", true);
    await dailyNotesInterface.createQuarterlyNote(date);

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/quarterly-notes/2020-Q4.md",
      "template contents"
    );
  });

  test("shows error if file creation failed", async () => {
    const createFn = window.app.vault.create;
    (createFn as jest.MockedFunction<typeof createFn>).mockRejectedValue(
      "error"
    );
    jest.spyOn(global.console, "error").mockImplementation();

    setQuarterlyConfig({
      enabled: true,
      folder: "/quarterly-notes",
      format: "YYYY-[Q]Q",
      template: "template",
    });
    const date = moment("2020-Q4", "YYYY-[Q]Q", true);

    await dailyNotesInterface.createQuarterlyNote(date);

    expect(console.error).toHaveBeenCalledWith(
      "Failed to create file: '/quarterly-notes/2020-Q4.md'",
      "error"
    );
  });
});

describe("createQuarterlyNote", () => {
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

    setQuarterlyConfig({
      enabled: true,
      folder: "/",
      format: "YYYY-[Q]Q",
      template: "template",
    });

    await dailyNotesInterface.createQuarterlyNote(window.moment());

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/2021-Q1.md",
      `
2021-Q1
2021-Q1
2021-Q1
2021 February
2021-02-17
2021-03-15
2031-02-15
2021-Q1
`
    );
  });
});
