import * as moment from "moment";

import getMockApp, { createFile, createFolder } from "src/testUtils/mockApp";

import * as dailyNotesInterface from "../index";

jest.mock("path");

function setConfig(config: dailyNotesInterface.IPeriodicNoteSettings): void {
  // eslint-disable-next-line
  (<any>window.app).plugins.plugins["monthly-notes"].options = config;
}

describe("getMonthlyNoteSettings", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.existingFiles = {};
    window.moment = moment;
  });

  test("returns all the monthly note settings", () => {
    setConfig({
      folder: "foo",
      format: "YYYY-MM",
      template: "template",
    });

    expect(dailyNotesInterface.getMonthlyNoteSettings()).toEqual({
      folder: "foo",
      format: "YYYY-MM",
      template: "template",
    });
  });

  test("cleanses data", () => {
    setConfig({
      folder: " foo/bar ",
      format: "YYYY-MM",
      template: "   path/to/template  ",
    });

    expect(dailyNotesInterface.getMonthlyNoteSettings()).toEqual({
      folder: "foo/bar",
      format: "YYYY-MM",
      template: "path/to/template",
    });
  });

  test("returns defaults if monthly note settings don't exist", () => {
    expect(dailyNotesInterface.getMonthlyNoteSettings()).toEqual({
      format: "YYYY-MM",
      folder: "",
      template: "",
    });
  });
});

describe("appHasMonthlyNotesPluginLoaded", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.existingFiles = {};
    window.moment = moment;
  });

  test("returns true when monthly notes plugin is enabled", () => {
    // eslint-disable-next-line
    (<any>window.app).plugins.plugins["monthly-notes"].enabled = true;

    expect(dailyNotesInterface.appHasMonthlyNotesPluginLoaded()).toEqual(true);
  });

  test("returns true when monthly notes plugin is enabled", () => {
    // eslint-disable-next-line
    (<any>window.app).plugins.plugins["monthly-notes"].enabled = false;

    expect(dailyNotesInterface.appHasMonthlyNotesPluginLoaded()).toEqual(false);
  });
});

describe("getAllMonthlyNotes", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment;
    window.existingFiles = {};
  });

  test("throws error if monthly note folder can't be found", () => {
    setConfig({
      folder: "missing-folder/",
      format: "YYYY-MM",
      template: "template",
    });

    expect(dailyNotesInterface.getAllMonthlyNotes).toThrow(
      "Failed to find monthly notes folder"
    );
  });

  test("returns a list of all monthly notes with no nested folders", () => {
    setConfig({
      folder: "/",
      format: "YYYY-MM",
      template: "template",
    });

    const fileA = createFile("2021-01", "");
    const fileB = createFile("2021-02", "");
    const fileC = createFile("2021-03", "");
    createFolder("/", [fileA, fileB, fileC]);

    expect(dailyNotesInterface.getAllMonthlyNotes()).toEqual({
      "month-2021-01-01T00:00:00-05:00": fileA,
      "month-2021-02-01T00:00:00-05:00": fileB,
      "month-2021-03-01T00:00:00-05:00": fileC,
    });
  });

  test("returns a list of all monthly notes including files nested in folders", () => {
    setConfig({
      folder: "/",
      format: "YYYY-MM",
      template: "template",
    });

    const fileA = createFile("2021-01", "");
    const fileB = createFile("2021-02", "");
    const fileC = createFile("2021-03", "");
    createFolder("/", [fileA, fileB, createFolder("foo", [fileC])]);

    expect(dailyNotesInterface.getAllMonthlyNotes()).toEqual({
      "month-2021-01-01T00:00:00-05:00": fileA,
      "month-2021-02-01T00:00:00-05:00": fileB,
      "month-2021-03-01T00:00:00-05:00": fileC,
    });
  });
});

describe("getMonthlyNote", () => {
  beforeEach(() => {
    window.existingFiles = {};
  });

  test("returns note on the same day even if the HH:MM:SS is different", () => {
    setConfig({
      folder: "/",
      format: "YYYY-MM-HHmm",
      template: "template",
    });

    const fileA = createFile("2020-02-0408", "");

    expect(
      dailyNotesInterface.getMonthlyNote(
        moment("2021-02-0745", "YYYY-MM-HHmm", true),
        {
          "month-2021-02-01T00:00:00-05:00": fileA,
        }
      )
    ).toEqual(fileA);
  });

  test("returns null if there is no monthly note for a given date", () => {
    setConfig({
      folder: "/",
      format: "YYYY-ww",
      template: "template",
    });

    const fileA = createFile("2020-01", "");

    expect(
      dailyNotesInterface.getMonthlyNote(moment("2020-01", "YYYY-ww", true), {
        "2020-12": fileA,
      })
    ).toEqual(null);
  });
});

describe("createMonthlyNote", () => {
  beforeEach(() => {
    window.existingFiles = {};
  });

  test("uses folder path from monthly note settings", async () => {
    setConfig({
      folder: "/monthly-notes",
      format: "YYYY-MM",
    });

    const date = moment("2020-10", "YYYY-MM", true);
    await dailyNotesInterface.createMonthlyNote(date);

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/monthly-notes/2020-10.md",
      ""
    );
  });

  test("uses template contents when creating file", async () => {
    setConfig({
      folder: "/monthly-notes",
      format: "YYYY-MM",
      template: "template",
    });

    createFile("template", "template contents");

    const date = moment("2020-10", "YYYY-MM", true);
    await dailyNotesInterface.createMonthlyNote(date);

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/monthly-notes/2020-10.md",
      "template contents"
    );
  });

  test("shows error if file creation failed", async () => {
    const createFn = window.app.vault.create;
    (createFn as jest.MockedFunction<typeof createFn>).mockRejectedValue(
      "error"
    );
    jest.spyOn(global.console, "error").mockImplementation();

    setConfig({
      folder: "/monthly-notes",
      format: "YYYY-MM",
      template: "template",
    });
    const date = moment("2020-10", "YYYY-MM", true);

    await dailyNotesInterface.createMonthlyNote(date);

    expect(console.error).toHaveBeenCalledWith(
      "Failed to create file: '/monthly-notes/2020-10.md'",
      "error"
    );
  });
});
