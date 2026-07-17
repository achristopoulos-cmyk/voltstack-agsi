import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GieClient, GieApiError, num, alsiFullness } from '../dist/index.js';

function mockFetch(handler) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url: String(url), init });
    return handler(String(url), init);
  };
  fn.calls = calls;
  return fn;
}

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

test('num parses numbers and treats "-" as unavailable', () => {
  assert.equal(num('58.4'), 58.4);
  assert.equal(num('0'), 0);
  assert.equal(num('-'), null);
  assert.equal(num(''), null);
  assert.equal(num(undefined), null);
  assert.equal(num('n/a'), null);
});

test('requires an apiKey', () => {
  assert.throws(() => new GieClient({ apiKey: '' }), /apiKey/);
});

test('storage() builds the query and sends the x-key header', async () => {
  const fetch = mockFetch(() => jsonResponse({ total: 1, count: 1, page: 1, last_page: 1, data: [{ full: '58.4' }] }));
  const client = new GieClient({ apiKey: 'k', fetch });
  const page = await client.storage({ country: 'DE', from: '2026-01-01', to: '2026-01-31', size: 300 });
  assert.equal(page.data[0].full, '58.4');
  const call = fetch.calls[0];
  const url = new URL(call.url);
  assert.equal(url.origin + url.pathname, 'https://agsi.gie.eu/api');
  assert.equal(url.searchParams.get('country'), 'DE');
  assert.equal(url.searchParams.get('from'), '2026-01-01');
  assert.equal(url.searchParams.get('size'), '300');
  assert.equal(call.init.headers['x-key'], 'k');
});

test('dataset "alsi" switches the base URL', async () => {
  const fetch = mockFetch(() => jsonResponse({ total: 0, count: 0, page: 1, last_page: 1, data: [] }));
  const client = new GieClient({ apiKey: 'k', dataset: 'alsi', fetch });
  await client.storage();
  assert.ok(fetch.calls[0].url.startsWith('https://alsi.gie.eu/api'));
});

test('non-2xx responses throw GieApiError with status', async () => {
  const fetch = mockFetch(() => new Response('bad key', { status: 401 }));
  const client = new GieClient({ apiKey: 'k', fetch });
  await assert.rejects(client.storage(), (err) => err instanceof GieApiError && err.status === 401);
});

test('records() paginates until last_page', async () => {
  const pages = {
    1: { total: 5, count: 2, page: 1, last_page: 3, data: [{ code: 'a' }, { code: 'b' }] },
    2: { total: 5, count: 2, page: 2, last_page: 3, data: [{ code: 'c' }, { code: 'd' }] },
    3: { total: 5, count: 1, page: 3, last_page: 3, data: [{ code: 'e' }] },
  };
  const fetch = mockFetch((url) => jsonResponse(pages[new URL(url).searchParams.get('page') ?? '1']));
  const client = new GieClient({ apiKey: 'k', fetch });
  const seen = [];
  for await (const rec of client.records({ country: 'DE' })) seen.push(rec.code);
  assert.deepEqual(seen, ['a', 'b', 'c', 'd', 'e']);
  assert.equal(fetch.calls.length, 3);
});

test('euAggregate() queries continent=EU with size 1', async () => {
  const fetch = mockFetch(() =>
    jsonResponse({ total: 1, count: 1, page: 1, last_page: 999, data: [{ full: '51.2', gasDayStart: '2026-07-15' }] })
  );
  const client = new GieClient({ apiKey: 'k', fetch });
  const rec = await client.euAggregate();
  assert.equal(rec.full, '51.2');
  const url = new URL(fetch.calls[0].url);
  assert.equal(url.searchParams.get('continent'), 'EU');
  assert.equal(url.searchParams.get('size'), '1');
});

test('alsiFullness() divides inventory.gwh by dtmi.gwh', () => {
  assert.equal(alsiFullness({ inventory: { gwh: '50' }, dtmi: { gwh: '200' } }), 25);
});

test('alsiFullness() treats a zero or missing dtmi.gwh as no data, not 0%', () => {
  assert.equal(alsiFullness({ inventory: { gwh: '0' }, dtmi: { gwh: '0' } }), null);
  assert.equal(alsiFullness({ inventory: { gwh: '10' }, dtmi: {} }), null);
  assert.equal(alsiFullness({ inventory: {}, dtmi: { gwh: '200' } }), null);
});

test(
  'live: EU aggregate has a plausible fill %',
  { skip: process.env.GIE_API_KEY ? false : 'skipped: no GIE_API_KEY' },
  async () => {
    const client = new GieClient({ apiKey: process.env.GIE_API_KEY });
    const rec = await client.euAggregate();
    const pct = num(rec?.full);
    assert.ok(pct !== null && pct > 0 && pct <= 100, `expected 0<pct<=100, got ${pct}`);
  }
);
