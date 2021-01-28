import { App, TAbstractFile, TFile, TFolder } from "obsidian";

declare global {
  interface Window {
    existingFiles: Record<string, TAbstractFile>;
  }
}

window.existingFiles = {};

export function createFile(basename: string, contents: string): TFile {
  const file = new TFile();
  file.basename = basename;
  file.path = `/${basename}.md`;
  // eslint-disable-next-line
  (file as any).cachedData = contents;

  window.existingFiles[file.path] = file;
  return file;
}

export function createFolder(path: string, children: TAbstractFile[]): TFolder {
  const folder = new TFolder();
  folder.path = path;
  folder.children = children;

  window.existingFiles[path] = folder;
  return folder;
}

/* eslint-disable */
export default function getMockApp(): App {
  return {
    vault: {
      adapter: {
        exists: () => Promise.resolve(false),
        getName: () => "",
        list: () => Promise.resolve(null),
        read: () => Promise.resolve(null),
        readBinary: () => Promise.resolve(null),
        write: () => Promise.resolve(),
        writeBinary: () => Promise.resolve(),
        getResourcePath: () => "",
        mkdir: () => Promise.resolve(),
        trashSystem: () => Promise.resolve(true),
        trashLocal: () => Promise.resolve(),
        rmdir: () => Promise.resolve(),
        remove: () => Promise.resolve(),
        rename: () => Promise.resolve(),
        copy: () => Promise.resolve(),
        setCtime: () => Promise.resolve(),
        setMtime: () => Promise.resolve(),
      },
      getName: () => "",
      getAbstractFileByPath: (path: string) =>
        window.existingFiles[path] || null,
      getRoot: () => ({
        children: [],
        isRoot: () => true,
        name: "",
        parent: null,
        path: "",
        vault: null,
      }),
      create: jest.fn(),
      createFolder: () => Promise.resolve(null),
      createBinary: () => Promise.resolve(null),
      read: () => Promise.resolve(""),
      cachedRead: (file: TFile) => {
        if (!file) {
          return Promise.reject("error");
        }
        // eslint-disable-next-line
        return Promise.resolve((file as any).cachedData);
      },
      readBinary: () => Promise.resolve(null),
      getResourcePath: () => null,
      delete: () => Promise.resolve(),
      trash: () => Promise.resolve(),
      rename: () => Promise.resolve(),
      modify: () => Promise.resolve(),
      modifyBinary: () => Promise.resolve(),
      copy: () => Promise.resolve(null),
      getAllLoadedFiles: () => [],
      getMarkdownFiles: () => [],
      getFiles: () => [],
      on: () => null,
      off: () => null,
      offref: () => null,
      tryTrigger: () => null,
      trigger: () => null,
    },
    workspace: null,
    metadataCache: {
      getCache: () => null,
      getFileCache: () => null,
      getFirstLinkpathDest: (linkpath: string, sourcePath: string) =>
        (window.existingFiles[`${linkpath}.md`] as TFile) || null,
      on: () => null,
      off: () => null,
      offref: () => null,
      tryTrigger: () => null,
      fileToLinktext: () => "",
      trigger: () => null,
    },
    on: () => null,
    off: () => null,
    offref: () => null,
    tryTrigger: () => null,
    trigger: () => null,
    // @ts-ignore
    plugins: {
      plugins: {
        calendar: {
          instance: {
            options: {
              format: "",
              template: "",
              folder: "",
            },
          },
        },
      },
    },
    // @ts-ignore
    internalPlugins: {
      plugins: {
        "daily-notes": {
          instance: {
            options: {
              format: "",
              template: "",
              folder: "",
            },
          },
        },
      },
    },
  };
}
/* eslint-enable */
