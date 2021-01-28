import * as moment from "moment";

import * as dailyNotesInterface from "../index";

import getMockApp, { createFile } from "src/testUtils/mockApp";

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
