import type { KeyValueStorage } from './types';

const DB_NAME = 'tidepool';
const STORE = 'kv';

function openDb(factory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = factory.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** IndexedDB key/value store. */
export class IdbStorage implements KeyValueStorage {
  private db: Promise<IDBDatabase>;
  constructor(factory: IDBFactory = indexedDB) {
    this.db = openDb(factory);
  }
  private async tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(req.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }
  async get(key: string) {
    const v = await this.tx<unknown>('readonly', (s) => s.get(key));
    return typeof v === 'string' ? v : null;
  }
  async set(key: string, value: string) {
    await this.tx('readwrite', (s) => s.put(value, key));
  }
  async remove(key: string) {
    await this.tx('readwrite', (s) => s.delete(key));
  }
  requestPersistence = requestPersistence;
}

/** localStorage fallback (private mode, old browsers). */
export class LocalStorageStorage implements KeyValueStorage {
  constructor(private ls: Storage = localStorage, private prefix = 'tidepool:') {}
  async get(key: string) {
    return this.ls.getItem(this.prefix + key);
  }
  async set(key: string, value: string) {
    this.ls.setItem(this.prefix + key, value);
  }
  async remove(key: string) {
    this.ls.removeItem(this.prefix + key);
  }
  requestPersistence = requestPersistence;
}

async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* ignore */
  }
  return false;
}

/** Picks IndexedDB if it works, otherwise localStorage. */
export async function createWebStorage(): Promise<KeyValueStorage> {
  try {
    if (typeof indexedDB !== 'undefined') {
      const s = new IdbStorage();
      await s.set('__probe', '1');
      return s;
    }
  } catch {
    /* fall through */
  }
  return new LocalStorageStorage();
}
