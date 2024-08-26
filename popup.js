
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
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = ''; // 清空现有内容

  if (bookmarks.length === 0) {
    resultDiv.textContent = '没有找到书签';
    return;
  }

  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';

  // 创建表头
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['书签名称', '书签名称', '书签名称', '地址', '创建/最后修改时间'].forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.border = '1px solid black';
    th.style.padding = '5px';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // 创建表体
  const tbody = document.createElement('tbody');
  bookmarks.forEach(bookmark => {
    const row = document.createElement('tr');

    const titleCell = document.createElement('td');
    titleCell.textContent = bookmark.title;
    titleCell.style.border = '1px solid black';
    titleCell.style.padding = '5px';
    row.appendChild(titleCell);

    const urlCell = document.createElement('td');
    urlCell.textContent = bookmark.url;
    urlCell.style.border = '1px solid black';
    urlCell.style.padding = '5px';
    row.appendChild(urlCell);

    const dateCell = document.createElement('td');
    dateCell.textContent = new Date(bookmark.dateAdded).toLocaleString();
    dateCell.style.border = '1px solid black';
    dateCell.style.padding = '5px';
    row.appendChild(dateCell);

    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  resultDiv.appendChild(table);
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

function flattenBookmarkTree(bookmarkNodes, treeId = "", treeName = "") {
  let bookmarks = [];
  for (let node of bookmarkNodes) {
    if (node.url) {
      // 对于 URL，直接使用当前的 treeId 和 treeName
      bookmarks.push(formatBookmark(node, treeId, treeName));
    } else if (node.children) {
      bookmarks.push(formatBookmark(node, treeId, treeName));
      // 只有在处理文件夹时才更新 treeId 和 treeName
      let currentTreeId = treeId ? `${treeId}/${node.id}` : node.id;
      let currentTreeName = treeName ? `${treeName}/${node.title}` : node.title;

      // 递归处理子节点
      bookmarks = bookmarks.concat(flattenBookmarkTree(node.children, currentTreeId, currentTreeName));
    }
  }
  return bookmarks;
}

function formatBookmark(node, treeId, treeName) {
  return {
    id: node.id,
    parentId: node.parentId,
    title: node.title,
    url: node.url,
    dateGroupModified: node.dateGroupModified,
    dateAdded: node.dateAdded,
    index: node.index,
    treeId: treeId,
    treeName: treeName,
    domain: new URL(node.url).hostname,
    domainTitle: "",
    keywords: "", // 可以根据需要添加关键词
    description: "", // 可以根据需要添加描述
    type: node.children ? "folder" : "bookmark",
    status: 0,
    dateAddedTime: new Date(node.dateAdded).toLocaleString(),
    dateGroupModifiedTime: node.dateGroupModified ? new Date(node.dateGroupModified).toLocaleString() : null
  };
}

