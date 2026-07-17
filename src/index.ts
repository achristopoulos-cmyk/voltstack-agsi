export type GieDataset = 'agsi' | 'alsi';

export interface GieClientOptions {
  /** API key from https://agsi.gie.eu (free registration). Sent as the `x-key` header. */
  apiKey: string;
  /** `agsi` = gas storage (default), `alsi` = LNG terminals. */
  dataset?: GieDataset;
  /** Override the base URL (testing, proxies). */
  baseUrl?: string;
  /** Custom fetch implementation (testing). Defaults to global fetch. */
  fetch?: typeof globalThis.fetch;
}

export interface StorageQuery {
  /** Two-letter country code, e.g. `DE`, `NL`, `FR`. */
  country?: string;
  /** EIC code or short name of a storage/terminal operator. */
  company?: string;
  /** EIC code of a single facility. */
  facility?: string;
  /** `EU` or `NE` (non-EU). Use for continent-level aggregates. */
  continent?: 'EU' | 'NE';
  /** Single gas day, `YYYY-MM-DD`. */
  date?: string;
  /** Range start, `YYYY-MM-DD`. */
  from?: string;
  /** Range end, `YYYY-MM-DD`. */
  to?: string;
  /** Page number, 1-based. */
  page?: number;
  /** Page size (API default 30, max 300). */
  size?: number;
}

/**
 * One row as returned by the API. All values are strings; the API uses `"-"`
 * for unavailable values (see {@link num}). Field availability differs
 * slightly between AGSI (storage) and ALSI (LNG) but the shape is shared.
 */
export interface GieRecord {
  name?: string;
  code?: string;
  url?: string;
  gasDayStart?: string;
  /** AGSI: % of working gas volume in storage. ALSI: % of DTMI. */
  full?: string;
  /** AGSI only: TWh currently in storage. */
  gasInStorage?: string;
  /** AGSI only: TWh of working gas volume. */
  workingGasVolume?: string;
  injection?: string;
  withdrawal?: string;
  injectionCapacity?: string;
  withdrawalCapacity?: string;
  /** ALSI only: send-out, GWh/d (a flow). */
  sendOut?: string;
  /** ALSI only: declared max send-out capacity, GWh/d (a flow cap, distinct from `dtmi`). */
  dtrs?: string;
  /** ALSI only: LNG held in tanks right now, GWh (a stock). Nested, not a flat string. */
  inventory?: { gwh?: string; [key: string]: unknown };
  /** ALSI only: declared total max tank capacity, GWh (a stock cap). Nested, not a flat string. */
  dtmi?: { gwh?: string; [key: string]: unknown };
  trend?: string;
  status?: string;
  info?: unknown;
  [key: string]: unknown;
}

export interface GiePage {
  total: number;
  count: number;
  page: number;
  last_page: number;
  gas_day?: string;
  data: GieRecord[];
  [key: string]: unknown;
}

export class GieApiError extends Error {
  readonly status: number;
  readonly url: string;
  constructor(status: number, url: string, body: string) {
    super(`GIE API responded ${status} for ${url}: ${body.slice(0, 200)}`);
    this.name = 'GieApiError';
    this.status = status;
    this.url = url;
  }
}

/**
 * Parse a GIE value string into a number, or `null` when the API reports the
 * value as unavailable (`"-"`, empty, or anything non-numeric).
 */
export function num(value: string | undefined | null): number | null {
  if (value == null || value === '' || value === '-') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * ALSI only. Derive tank fullness as a percentage from `inventory.gwh` /
 * `dtmi.gwh` (ALSI has no vendor-computed `full` field the way AGSI does).
 *
 * Some ALSI rows (observed for GB / "United Kingdom (Pre-Brexit)" on
 * historical gas days) carry the literal string `"0"` for both fields
 * rather than the usual `"-"` for unavailable data. Dividing those would
 * read as a real 0% fullness rather than an honest gap, so this helper
 * treats a zero or missing `dtmi.gwh` as "no data" and returns `null`.
 */
export function alsiFullness(record: Pick<GieRecord, 'inventory' | 'dtmi'>): number | null {
  const inventory = num(record.inventory?.gwh);
  const capacity = num(record.dtmi?.gwh);
  if (inventory === null || capacity === null || capacity <= 0) return null;
  return Number(((inventory / capacity) * 100).toFixed(1));
}

const BASE_URLS: Record<GieDataset, string> = {
  agsi: 'https://agsi.gie.eu/api',
  alsi: 'https://alsi.gie.eu/api',
};

/**
 * Minimal client for GIE's AGSI+ (EU gas storage) and ALSI (LNG terminal)
 * transparency APIs. Zero dependencies, Node 18+ (global fetch).
 *
 * GIE's terms require crediting GIE (AGSI/ALSI) as the data source when the
 * data is used or republished.
 */
export class GieClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: GieClientOptions) {
    if (!options.apiKey) throw new Error('GieClient requires an apiKey (register free at agsi.gie.eu)');
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? BASE_URLS[options.dataset ?? 'agsi'];
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  /** One page of records. The most recent gas day is `data[0]`. */
  async storage(query: StorageQuery = {}): Promise<GiePage> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v != null) params.set(k, String(v));
    }
    const qs = params.toString();
    const url = qs ? `${this.baseUrl}?${qs}` : this.baseUrl;
    const res = await this.fetchImpl(url, { headers: { 'x-key': this.apiKey } });
    if (!res.ok) throw new GieApiError(res.status, url, await res.text().catch(() => ''));
    return (await res.json()) as GiePage;
  }

  /**
   * Iterate every record across pages for a query. Respect GIE's rate limit
   * (60 requests/minute) when paging over long histories.
   */
  async *records(query: StorageQuery = {}): AsyncGenerator<GieRecord> {
    let page = query.page ?? 1;
    for (;;) {
      const res = await this.storage({ ...query, page });
      yield* res.data;
      if (page >= res.last_page || res.data.length === 0) return;
      page += 1;
    }
  }

  /** Latest EU-wide aggregate (AGSI) or a specific gas day when `date` is given. */
  async euAggregate(date?: string): Promise<GieRecord | null> {
    const res = await this.storage({ continent: 'EU', ...(date ? { date } : {}), size: 1 });
    return res.data[0] ?? null;
  }

  /** Latest record for one country, or a range when `from`/`to` are given. */
  async country(code: string, query: Omit<StorageQuery, 'country'> = {}): Promise<GiePage> {
    return this.storage({ ...query, country: code });
  }
}
