importScripts('dbManager.js');

chrome.runtime.onInstalled.addListener(() => {
    console.log("Bookmark Extender 插件已安装");
    DBManager.initDatabase();
    console.log("数据库初始化完成");
});

