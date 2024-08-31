const DBManager = {
    db: null,
    status: "0",
    dbName: "BookmarksDB",
    dbVersion: 3,  // 每次修改数据库结构时增加这个值
    storeName: "M-bookmarksStore",

    initDatabase: function () {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = event => {
                console.error("数据库打开出错", event);
                reject("数据库打开出错");
            };
            request.onsuccess = event => {
                this.db = event.target.result;
                console.log("数据库成功打开");
                resolve(this.db);
            };
            request.onupgradeneeded = event => {
                console.log("数据库升级中");
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains(this.storeName)) {
                    console.log(`创建对象存储 ${this.storeName}`);
                    const objectStore = this.db.createObjectStore(this.storeName, {keyPath: "id"});
                }
            };
        });
    },
    saveBookmarks: function (bookmarks) {
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                console.log("开始存储书签，总数：", bookmarks.length);
                const transaction = this.db.transaction([this.storeName], "readwrite");
                const objectStore = transaction.objectStore(this.storeName);
                let count = 0;
                bookmarks.forEach(bookmark => {
                    const request = objectStore.put(bookmark);
                    request.onsuccess = () => {
                        count++;
                        if (count % 100 === 0) {
                            console.log(`已存储 ${count} 个书签`);
                        }
                    };
                    request.onerror = (event) => {
                        console.error("存储书签时出错", event.target.error);
                    };
                });

                transaction.oncomplete = () => {
                    console.log(`所有书签已成功存储，总数：${count}`);
                    resolve();
                };

                transaction.onerror = event => {
                    console.error("事务出错", event.target.error);
                    reject(event);
                };
            });
        });
    },
    deleteBookmarks: function (bookmarks) {
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                console.log("开始存储书签，总数：", bookmarks.length);
                const transaction = this.db.transaction([this.storeName], "readwrite");
                const objectStore = transaction.objectStore(this.storeName);
                bookmarks.forEach(bookmark => {
                    const request = objectStore.delete(bookmark);
                    request.onerror = (event) => {
                        console.error("删除异常", event.target.error);
                    };
                });

                transaction.oncomplete = () => {
                    console.log(`删除完成!`);
                    resolve();
                };

                transaction.onerror = event => {
                    console.error("删除事务出错", event.target.error);
                    reject(event);
                };
            });
        });
    },
    queryBookmarks: function (queryDto) {
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                if (!queryDto || !queryDto.value || !queryDto.prop || !queryDto.operator) {
                    reject("查询参数错误");
                }
                const {prop, operator, value, limit = -1} = queryDto;
                // 根据不同的匹配规则进行查询
                let query;
                switch (operator) {
                    case 'eq':
                        query = `WHERE ${prop} = ?`;
                        break;
                    case 'like':
                        query = `WHERE ${prop} LIKE ?`;
                        break;
                    case 'gt':
                        query = `WHERE ${prop} > ?`;
                        break;
                    case 'lt':
                        query = `WHERE ${prop} < ?`;
                        break;
                    default:
                        return [];
                }
                const transaction = this.db.transaction([this.storeName], "readonly");
                const objectStore = transaction.objectStore(this.storeName);

                const request = objectStore.openCursor();
                const results = [];
                let count = 0;
                request.onsuccess = event => {
                    const cursor = event.target.result;
                    console.log("count:" + count + "-limit:" + limit);
                    if (limit != -1 && count >= limit) {
                        console.log(`搜索完成，找到 ${results.length} 个结果`);
                        resolve(results);
                    } else if (cursor) {
                        debugger;
                        if (operator === 'like') {
                            const regex = new RegExp(value, 'i');
                            if (regex.test(cursor.value[prop])) {
                                results.push(cursor.value);
                            }
                        } else {
                            if (eval(`${cursor.value[prop]}
                            ${operator}
                            "${value}"`)) {
                                results.push(cursor.value);
                            }
                        }
                        cursor.continue();
                    } else {
                        console.log(`搜索完成，找到 ${results.length} 个结果`);
                        resolve(results);
                    }
                };

                request.onerror = event => {
                    console.error("搜索书签时发生错误", event);
                    reject(event);
                };
            });
        });
    }

};


export default  DBManager
