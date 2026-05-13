import type moment from "moment";

// `moment` has a UMD-style export where the `Moment` interface lives
// inside the `moment` namespace rather than being a top-level named
// export. Reach into the namespace and re-export so the rest of the
// library can `import type { Moment } from "./moment-types"`.
//
// `moment` stays a devDependency only - the runtime always uses
// `window.moment` (Obsidian-bundled), and consumers inherit the moment
// types transitively through their `obsidian` install.
export type Moment = moment.Moment;
