type IDBEventTarget = EventTarget & { result: any };
export default class IDBhelper {
  async connectDB(baseName: string, storeName: string): Promise<IDBDatabase> {
    var request = indexedDB.open(baseName, 1);
    request.onupgradeneeded = function (e: IDBVersionChangeEvent) {
      const target = e.currentTarget as IDBEventTarget;
      const db = target.result;
      db.createObjectStore(storeName, {
        keyPath: "id",
        autoIncrement: true,
      });
    };
    return new Promise((res, rej) => {
      request.onerror = (err) => {
        rej(err);
      };
      request.onsuccess = function () {
        res(request.result);
      };
    });
  }
  async findAll(baseName: string, storeName: string): Promise<any[]> {
    const db = await this.connectDB(baseName, storeName);

    const rows: any[] = [],
      store = db.transaction([storeName], "readonly").objectStore(storeName);
    return new Promise((res) => {
      store.openCursor().onsuccess = function (e: Event) {
        const target = e.target as IDBEventTarget;
        const cursor = target.result;
        if (cursor) {
          rows.push(cursor.value);
          cursor.continue();
        } else {
          res(rows);
        }
      };
    });
  }
  async find(
    baseName: string,
    storeName: string,
    predicate: (item: any) => boolean
  ) {
    return new Promise(async (resolve) => {
      const db = await this.connectDB(baseName, storeName);
      const store = db
        .transaction([storeName], "readonly")
        .objectStore(storeName);
      store.openCursor().onsuccess = function (e) {
        const target = e.target as IDBEventTarget;
        const cursor = target.result;
        if (!cursor) {
          resolve(null);
        }
        if (!cursor.value) {
          cursor.continue();
        }
        if (predicate(cursor.value)) {
          resolve(cursor.value);
        }
        cursor.continue();
      };
    });
  }

  async create(baseName: string, storeName: string, item: any) {
    const db = await this.connectDB(baseName, storeName);

    const request = db
      .transaction([storeName], "readwrite")
      .objectStore(storeName)
      .put(item);
    return new Promise((res) => {
      request.onerror = (err) => {
        res(false);
      };
      request.onsuccess = function () {
        res(true);
      };
    });
  }
  async bulkCreate(baseName: string, storeName: string, items: any[]) {
    return await Promise.all(
      items.map((item) => this.create(baseName, storeName, item))
    );
  }
}
