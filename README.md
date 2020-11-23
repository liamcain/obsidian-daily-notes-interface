[![NPM](https://nodei.co/npm/obsidian-daily-notes-interface.png?mini=true)](https://npmjs.org/package/obsidian-daily-notes-interface)

# Obsidian Daily Notes interface [FOR DEVELOPERS]

Replicates the daily-notes plugin in Obsidian but allows creating a note for any day (past or present).

## Installation

The best way to use this package is to add it to your dependencies:

```
# if you use npm:
npm install --save obsidian-daily-notes-interface

# or if you use Yarn:
yarn add obsidian-daily-notes-interface
```

## Basic Usage

```ts
import { createDailyNote } from 'obsidian-daily-notes-interface';
...

createDailyNote(moment());
```
