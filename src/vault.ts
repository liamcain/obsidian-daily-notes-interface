import { normalizePath, App, Notice } from "obsidian";
import { join } from "path";

export function getNotePath(directory: string, filename: string): string {
  if (!filename.endsWith(".md")) {
    filename += ".md";
  }
  return normalizePath(join(directory, filename));
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
