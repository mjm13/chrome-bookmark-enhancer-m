<template>
  <el-container>
    <el-aside width="200px">
      <el-tree
        :data="treeData"
        :props="defaultProps"
        @node-click="handleNodeClick"
      ></el-tree>
    </el-aside>
    <el-container>
      <el-header>
        <h2>书签列表</h2>
      </el-header>
      <el-main>
        <el-table :data="bookmarks" style="width: 100%">
          <el-table-column prop="title" label="标题" width="180">
            <template #default="scope">
              <el-link :href="scope.row.url" target="_blank">{{ scope.row.title }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="url" label="URL" width="300"></el-table-column>
          <el-table-column prop="metaKeywords" label="关键词"></el-table-column>
          <el-table-column prop="metaDescription" label="描述"></el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ElContainer, ElAside, ElHeader, ElMain, ElTable, ElTableColumn, ElTree, ElLink } from 'element-plus';

export default {
  name: 'App',
  components: {
    ElContainer,
    ElAside,
    ElHeader,
    ElMain,
    ElTable,
    ElTableColumn,
    ElTree,
    ElLink
  },
  data() {
    return {
      treeData: [], // 树型菜单数据
      bookmarks: [], // 书签数据
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    };
  },
  methods: {
    handleNodeClick(data) {
      // 根据点击的节点加载书签数据
      // this.loadBookmarks(data.id);
    },
    loadBookmarks(treeId) {
      // 这里可以调用 DBManager 或其他方法来加载书签数据
      // 示例：假设从 DBManager 获取书签
      // DBManager.getBookmarksByTreeId(treeId).then(bookmarks => {
      //   this.bookmarks = bookmarks;
      // });
    }
  },
  mounted() {
    // 初始化树型菜单数据
    this.treeData = [
      { id: 1, title: '书签文件夹 1', children: [] },
      { id: 2, title: '书签文件夹 2', children: [] }
    ];
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>