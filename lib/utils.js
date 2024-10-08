
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
      title: node.title,//添加书签时标题
      url: node.url,
      dateGroupModified: node.dateGroupModified,
      dateAdded: node.dateAdded,
      index: node.index,//显示位置
      treeId: treeId,//目录id结构
      treeName: treeName,//目录结构
      domain: node.url? new URL(node.url).hostname : null,
      domainTitle: "",
      metaTitle:"",
      metaKeywords: "", // 扩展后增加meta中对应属性
      metaDescription: "", // 扩展后增加meta中对应属性
      type: node.children ? "folder" : "bookmark",
      status: 0, //0:未处理，1:爬取数据中,2:爬取完成，-1：无法访问，
      dateAddedTime: new Date(node.dateAdded).toLocaleString(),
      dateGroupModifiedTime: node.dateGroupModified ? new Date(node.dateGroupModified).toLocaleString() : null
    };
  }  