import * as moment from "moment";

import getMockApp, { createFile, createFolder } from "src/testUtils/mockApp";

import * as dailyNotesInterface from "../index";

function setConfig(config: dailyNotesInterface.IDailyNoteSettings): void {
  // eslint-disable-next-line
  (<any>window.app).internalPlugins.plugins[
    "daily-notes"
  ].instance.options = config;
}

describe("getDailyNoteSettings", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.existingFiles = {};
    window.moment = moment;
  });

  test("returns all the daily note settings", () => {
    setConfig({
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
    setConfig({
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

describe("getTemplateContents", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment;
    window.existingFiles = {};

    createFile("fileA", "A. Lorem ipsum dolor sit amet");
    createFile("fileB", "B. Lorem ipsum dolor sit amet");
    createFile("fileC", "C. Lorem ipsum dolor sit amet");
  });

  test("returns '' if path is empty", async () => {
    const templateContents = await dailyNotesInterface.getTemplateContents("");
    expect(templateContents).toEqual("");
  });

  test("returns contents of the template file", async () => {
    const templateContents = await dailyNotesInterface.getTemplateContents(
      "fileA"
    );
    expect(templateContents).toEqual("A. Lorem ipsum dolor sit amet");
  });

  test("throws error if file can't be found", async () => {
    jest.spyOn(global.console, "error").mockImplementation();

    const templateContents = await dailyNotesInterface.getTemplateContents(
      "nonexistent-file"
    );

    expect(console.error).toHaveBeenCalledWith(
      "Failed to read the daily note template '/nonexistent-file'",
      "error"
    );
    expect(templateContents).toEqual("");
  });
});

describe("getAllDailyNotes", () => {
  beforeEach(() => {
    window.app = getMockApp();
    window.moment = moment;
    window.existingFiles = {};
  });

  test("throws error if daily note folder can't be found", () => {
    setConfig({
      folder: "missing-folder/",
      format: "YYYY-MM-DD",
      template: "template",
    });

    expect(dailyNotesInterface.getAllDailyNotes).toThrow(
      "Failed to find daily notes folder"
    );
  });

  test("returns a list of all daily notes with no nested folders", () => {
    setConfig({
      folder: "/",
      format: "YYYY-MM-DD",
      template: "template",
    });

    const fileA = createFile("2020-12-01", "");
    const fileB = createFile("2020-12-02", "");
    const fileC = createFile("2020-12-03", "");
    createFolder("/", [fileA, fileB, fileC]);

    expect(dailyNotesInterface.getAllDailyNotes()).toEqual([
      {
        file: fileA,
        date: moment("2020-12-01", "YYYY-MM-DD", true),
      },
      {
        file: fileB,
        date: moment("2020-12-02", "YYYY-MM-DD", true),
      },
      {
        file: fileC,
        date: moment("2020-12-03", "YYYY-MM-DD", true),
      },
    ]);
  });

  test("returns a list of all daily notes including files nested in folders", () => {
    setConfig({
      folder: "/",
      format: "YYYY-MM-DD",
      template: "template",
    });

    const fileA = createFile("2020-12-01", "");
    const fileB = createFile("2020-12-02", "");
    const fileC = createFile("2020-12-03", "");
    createFolder("/", [fileA, fileB, createFolder("foo", [fileC])]);

    expect(dailyNotesInterface.getAllDailyNotes()).toEqual([
      {
        file: fileA,
        date: moment("2020-12-01", "YYYY-MM-DD", true),
      },
      {
        file: fileB,
        date: moment("2020-12-02", "YYYY-MM-DD", true),
      },
      {
        file: fileC,
        date: moment("2020-12-03", "YYYY-MM-DD", true),
      },
    ]);
  });
});

describe("getDailyNote", () => {
  beforeEach(() => {
    window.existingFiles = {};
  });

  test("finds exact match file before checking daily notes list (optimization)", () => {
    setConfig({
      folder: "/",
      format: "YYYY-MM-DD",
      template: "template",
    });

    const fileA = createFile("2020-12-01", "");

    expect(
      dailyNotesInterface.getDailyNote(
        moment("2020-12-01", "YYYY-MM-DD", true),
        []
      )
    ).toEqual(fileA);
  });

  test("returns note on the same day even if the HH:MM:SS is different", () => {
    setConfig({
      folder: "/",
      format: "YYYY-MM-DD-HHmm",
      template: "template",
    });

    const fileA = createFile("2020-12-01-0408", "");
    const dateA = moment("2020-12-01-0408", "YYYY-MM-DD-HHmm", true);

    expect(
      dailyNotesInterface.getDailyNote(
        moment("2020-12-01-0745", "YYYY-MM-DD-HHmm", true),
        [
          {
            file: fileA,
            date: dateA,
          },
        ]
      )
    ).toEqual(fileA);
  });

  test("returns null if there is no daily note for a given date", () => {
    setConfig({
      folder: "/",
      format: "YYYY-MM-DD",
      template: "template",
    });

    const fileA = createFile("2020-12-03", "");
    const dateA = moment("2020-12-03", "YYYY-MM-DD", true);

    expect(
      dailyNotesInterface.getDailyNote(
        moment("2020-12-01", "YYYY-MM-DD", true),
        [
          {
            file: fileA,
            date: dateA,
          },
        ]
      )
    ).toEqual(null);
  });
});

describe("createDailyNote", () => {
  beforeEach(() => {
    window.existingFiles = {};
  });

  test("uses folder path from daily note settings", async () => {
    setConfig({
      folder: "/daily-notes",
      format: "YYYY-MM-DD",
      template: "template",
    });

    const date = moment("2020-10-05", "YYYY-MM-DD", true);
    await dailyNotesInterface.createDailyNote(date);

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/daily-notes/2020-10-05.md",
      ""
    );
  });

  test("uses template contents when creating file", async () => {
    setConfig({
      folder: "/daily-notes",
      format: "YYYY-MM-DD",
      template: "template",
    });

    createFile("template", "template contents");

    const date = moment("2020-10-05", "YYYY-MM-DD", true);
    await dailyNotesInterface.createDailyNote(date);

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/daily-notes/2020-10-05.md",
      "template contents"
    );
  });

  test("replaces {{date}} {{time}} and {{title}} in template", async () => {
    setConfig({
      folder: "/daily-notes",
      format: "YYYY-MM-DD",
      template: "template",
    });

    createFile("template", "## template {{date}} {{time}} {{title}}");

    const date = moment("2020-10-05", "YYYY-MM-DD", true);
    const currentTimestamp = moment().format("HH:mm");

    await dailyNotesInterface.createDailyNote(date);

    expect(window.app.vault.create).toHaveBeenCalledWith(
      "/daily-notes/2020-10-05.md",
      `## template 2020-10-05 ${currentTimestamp} 2020-10-05`
    );
  });

  test("shows error if file creation failed", async () => {
    const createFn = window.app.vault.create;
    (createFn as jest.MockedFunction<typeof createFn>).mockRejectedValue(
      "error"
    );
    jest.spyOn(global.console, "error").mockImplementation();

    setConfig({
      folder: "/daily-notes",
      format: "YYYY-MM-DD",
      template: "template",
    });
    const date = moment("2020-10-05", "YYYY-MM-DD", true);

    await dailyNotesInterface.createDailyNote(date);

    expect(console.error).toHaveBeenCalledWith(
      "Failed to create file: '/daily-notes/2020-10-05.md'",
      "error"
    );
  });
});
