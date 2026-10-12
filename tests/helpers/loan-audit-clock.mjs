// Test-only clock; never shipped or used to update source verification timestamps.
const RealDate = Date;
globalThis.Date = class extends RealDate {
 constructor(...args) { super(...(args.length ? args : ['2026-10-10T12:00:00Z'])); }
 static now() { return new RealDate('2026-10-10T12:00:00Z').getTime(); }
};
