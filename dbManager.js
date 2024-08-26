const DBManager = {
    db: null,
    status: "0",
    dbName: "BookmarksDB",
    dbVersion: 3,  // 每次修改数据库结构时增加这个值
    storeName: "M-bookmarksStore",

    checkVersion: function () {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const currentVersion = db.version;
                db.close();
                console.log(`当前数据库版本: ${currentVersion}`);
                resolve(currentVersion);
            };
            request.onerror = (event) => {
                console.error("检查版本时出错", event);
                reject(event);
            };
        });
    },

    initDatabase: function () {
        return this.checkVersion().then(currentVersion => {
            if (currentVersion < this.dbVersion) {
                console.log(`需要升级数据库从版本 ${currentVersion} 到 ${this.dbVersion}`);
                return this.openDatabase(this.dbVersion);
            } else {
                return this.openDatabase(currentVersion);
            }
            this.status = "1";
        });
    },
    getBookmarkCount: function () {
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], "readonly");
                const objectStore = transaction.objectStore(this.storeName);
                const countRequest = objectStore.count();

                countRequest.onsuccess = function () {
                    resolve(countRequest.result);
                };

                countRequest.onerror = function (event) {
                    console.error("获取书签数量时出错:", event);
                    reject(event);
                };
            });
        });
    },

    openDatabase: function (version) {
        return new Promise((resolve, reject) => {
            console.log(`开始打开数据库，版本: ${version}`);
            const request = indexedDB.open(this.dbName, version);

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
                    const objectStore = this.db.createObjectStore(this.storeName, { keyPath: "id" });

                    const indexes = [
                        { name: "parentId", keyPath: "parentId", options: { unique: false } },
                        { name: "treeId", keyPath: "treeId", options: { unique: false } },
                        { name: "treeName", keyPath: "treeName", options: { unique: false } },
                        { name: "title", keyPath: "title", options: { unique: false } },
                        { name: "keywords", keyPath: "keywords", options: { unique: false } },
                        { name: "description", keyPath: "description", options: { unique: false } },
                        { name: "url", keyPath: "url", options: { unique: false } },
                        { name: "domain", keyPath: "domain", options: { unique: false } },
                        { name: "status", keyPath: "status", options: { unique: false } }
                    ];

                    indexes.forEach(index => {
                        try {
                            objectStore.createIndex(index.name, index.keyPath, index.options);
                            console.log(`索引 ${index.name} 创建成功`);
                        } catch (error) {
                            console.error(`创建索引 ${index.name} 时出错:`, error);
                        }
                    });

                    console.log("所有索引创建完成");
                } else {
                    console.log(`对象存储 ${this.storeName} 已存在`);
                }
            };
        });
    },

    storeBookmarks: function (bookmarks) {
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

    verifyBookmarks: function () {
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], "readonly");
                const objectStore = transaction.objectStore(this.storeName);
                const countRequest = objectStore.count();

                countRequest.onsuccess = () => {
                    console.log(`数据库中的书签数量：${countRequest.result}`);
                    resolve(countRequest.result);
                };

                countRequest.onerror = (event) => {
                    console.error("验证书签数量时出错", event.target.error);
                    reject(event);
                };
            });
        });
    },

    extendBookMarks: function () {
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                const getBookmarkTransaction = this.db.transaction([this.storeName], "readonly");
                const objectStore = getBookmarkTransaction.objectStore(this.storeName);
    
                const request = objectStore.get("104");
    
                request.onsuccess = async (event) => {
                    const bookmark = event.target.result;
                    if (bookmark && bookmark.url) {
                        try {
                            bookmark.status = 1;
                            await this.updateBookmark(bookmark);
    
                            console.log(`正在获取网页内容：${bookmark.url}`);
                            
                            chrome.runtime.sendMessage({action: 'fetchUrl', url: bookmark.url}, async response => {
                                if (response.error) {
                                    throw new Error(response.error);
                                }
    
                                const { metaKeywords, metaDescription } = response.data;
    
                                bookmark.keywords = metaKeywords;
                                bookmark.description = metaDescription;
                                bookmark.status = 2;
    
                                await this.updateBookmark(bookmark);
                                console.log("书签处理完成");
                                resolve(bookmark);
                            });
                        } catch (error) {
                            console.error(`处理书签时出错: ${bookmark.url}`, error);
                            bookmark.status = 3;
                            bookmark.errorMessage = error.message;
                            bookmark.errorDetails = error.stack;
                            await this.updateBookmark(bookmark);
                            reject(error);
                        }
                    } else {
                        console.log("未找到指定ID的书签或书签没有URL");
                        resolve(null);
                    }
                };
    
                request.onerror = (event) => {
                    console.error("获取书签时发生错误", event);
                    reject(event);
                };
            });
        });
    },

    // 新增方法：更新书签
    updateBookmark: function (bookmark) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite");
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.put(bookmark);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event);
        });
    },

    searchBookmarks: function (query, limit) {
        limit = limit || 10;
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], "readonly");
                const objectStore = transaction.objectStore(this.storeName);
                const index = objectStore.index("title");

                const request = index.openCursor();
                const results = [];
                let count = 0;

                request.onsuccess = event => {
                    const cursor = event.target.result;

                    console.log("count:" + count + "-limit:" + limit);
                    if (count >= limit) {
                        console.log(`搜索完成，找到 ${results.length} 个结果`);
                        resolve(results);
                    } else if (cursor) {
                        if (cursor.value.title.toLowerCase().includes(query.toLowerCase())) {
                            results.push(cursor.value);
                            count++;
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