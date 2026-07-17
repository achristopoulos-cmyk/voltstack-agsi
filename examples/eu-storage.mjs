// Run: npm run build && node examples/eu-storage.mjs
// Requires GIE_API_KEY in the environment (register free at https://agsi.gie.eu/account).
//
// This example imports the local build for convenience when running inside
// this repo. When installed from npm, import from '@voltstack/agsi' instead:
//   import { GieClient, num } from '@voltstack/agsi';
import { GieClient } from '../dist/index.js';

const apiKey = process.env.GIE_API_KEY;
if (!apiKey) {
  console.error('Set GIE_API_KEY to run this example (register free at https://agsi.gie.eu/account).');
  process.exit(1);
}

const agsi = new GieClient({ apiKey });
const eu = await agsi.euAggregate();
console.log(`EU gas storage: ${eu?.full}% full on gas day ${eu?.gasDayStart}`);

const alsi = new GieClient({ apiKey, dataset: 'alsi' });
const lng = await alsi.euAggregate();
console.log(`EU LNG send-out: ${lng?.sendOut} GWh/d on gas day ${lng?.gasDayStart}`);
