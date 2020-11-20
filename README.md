# Obsidian Daily Notes interface

Replicates the daily-notes plugin in Obsidian but allows creating a note for any day (past or present).

## Installation

The best way to use this package is to add it to your dependencies:

```
# if you use npm:
npm install --save liamcain/obsidian-daily-notes-interface#main

# or if you use Yarn:
yarn add liamcain/obsidian-daily-notes-interface#main
```

## Basic Usage

```ts
import { createDailyNote } from 'obsidian-daily-notes-interface';
...

createDailyNote(moment());
```
