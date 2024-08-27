
document.addEventListener('DOMContentLoaded', function () {
  setupEventListeners();
});

function setupEventListeners() {
  // 搜索功能的事件监听器
  document.getElementById('searchBtn').addEventListener('click', searchBookMarks);
  // 初始化书签的事件监听器
  document.getElementById('initBtn').addEventListener('click', initializeBookmarks);
  // 扩展原有书签数据
  document.getElementById('extenderBtn').addEventListener('click', extenderBookmarks);


  DBManager.getBookmarkCount()
    .then(count => {
      // 假设我们有一个 ID 为 'bookmarkCount' 的元素来显示数量
      const countElement = document.getElementById('extenderStatus');
      if (countElement) {
        countElement.textContent = `总共有 ${count} 个书签`;
      }
    })
    .catch(error => {
      console.error("获取书签数量时出错:", error);
    });
}

function extenderBookmarks() {
  DBManager.extendBookMarks()
    .then(() => {
      alert("加载完成");
    })
    .catch(error => {
      console.log("搜索出错:" + error);
    });
}

function searchBookMarks() {
  let keyword = document.getElementById('keyword').value;
  DBManager.searchBookmarks(keyword)
    .then(results => {
      displayBookmarksTable(results);
    })
    .catch(error => {
      console.log("搜索出错:" + error);
    });
}

function displayBookmarksTable(bookmarks) {
  const resultTable = document.getElementById('resultTable').getElementsByTagName('tbody')[0];
  if (bookmarks.length === 0) {
    const row = resultTable.insertRow();
    row.insertCell(0).textContent = "未找到书签!";
    return;
  }
  bookmarks.forEach(bookmark => {
      const row = resultTable.insertRow();
      row.insertCell(0).textContent = bookmark.treeName;
      row.insertCell(1).innerHTML = `<a href="${bookmark.url}" target="_blank">${bookmark.title?bookmark.title:bookmark.url}</a`;
      row.insertCell(2).textContent = bookmark.metaKeywords;
      row.insertCell(3).textContent = bookmark.metaDescription;
  });	
}


function initializeBookmarks() {
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    console.log("开始初始化书签");
    const bookmarks = flattenBookmarkTree(bookmarkTreeNodes);
    console.log(bookmarks.length)
    DBManager.storeBookmarks(bookmarks)
      .then(() => {
        console.log("书签初始化完成");
        return DBManager.verifyBookmarks();
      })
      .then((count) => {
        console.log(`书签已成功初始化！数据库中共有 ${count} 个书签。`);
      })
      .catch(error => {
        console.error("初始化或验证书签时出错:", error);
      });
  });
}
