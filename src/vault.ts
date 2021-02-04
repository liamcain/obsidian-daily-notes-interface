import { normalizePath, App, Notice } from "obsidian";
import { join } from "path";

async function ensureFolderExists(path: string): Promise<void> {
  const dirs = path.split("/");
  dirs.pop();

  let dir = "";
  while (dirs.length) {
    dir = join(dir, dirs.shift()).replace(/\\/g, "/");
    if (!window.app.vault.getAbstractFileByPath(dir)) {
      await window.app.vault.createFolder(dir);
    }
  }
}

export async function getNotePath(
  directory: string,
  filename: string
): Promise<string> {
  if (!filename.endsWith(".md")) {
    filename += ".md";
  }
  const path = normalizePath(join(directory, filename));

  await ensureFolderExists(path);

  return path;
}

export async function getTemplateContents(template: string): Promise<string> {
  const app = window.app as App;
  const { metadataCache, vault } = app;

  const templatePath = normalizePath(template);
  if (templatePath === "/") {
    return Promise.resolve("");
  }

  try {
    const templateFile = metadataCache.getFirstLinkpathDest(templatePath, "");
    const contents = await vault.cachedRead(templateFile);
    return contents;
  } catch (err) {
    console.error(
      `Failed to read the daily note template '${templatePath}'`,
      err
    );
    new Notice("Failed to read the daily note template");
    return "";
  }
}
