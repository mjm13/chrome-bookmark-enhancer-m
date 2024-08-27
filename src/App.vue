<template>
  <el-container style="height: 95vh">
    <el-aside
      :style="{ width: asideWidth + 'px', cursor: 'ew-resize',border:'1px solid #eee' }"
      @mousedown="startDrag"
      @mouseup="stopDrag"
    >
      <el-tree
        :data="treeData"
        :props="defaultProps"
        @node-click="handleNodeClick"
      ></el-tree>
    </el-aside>
    <el-container>
      <el-header>
        <el-input
          placeholder="搜索书签"
          v-model="searchQuery"
        ></el-input>
        <el-button type="primary" @click="searchBookmarks">搜索</el-button>
        <el-button type="success" @click="addBookmark">添加书签</el-button>
      </el-header>
      <el-main>
        <el-table :data="bookmarks" style="width: 100%" size="small">
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
import { ElContainer, ElAside, ElHeader, ElMain, ElTable, ElTableColumn, ElTree, ElLink, ElInput, ElButton } from 'element-plus';

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
    ElLink,
    ElInput,
    ElButton
  },
  data() {
    return {
      treeData: [],
      bookmarks: [],
      searchQuery: '',
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      asideWidth: 200, // 初始宽度
      isDragging: false, // 拖动状态
      startX: 0 // 鼠标起始位置
    };
  },
  methods: {
    startDrag(event) {
      event.preventDefault(); 
      this.isDragging = true;
      this.startX = event.clientX; // 记录鼠标起始位置
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
      console.log("startDrag");
    },
    onDrag(event) {
      event.preventDefault(); 
      if (this.isDragging) {
        const diffX = event.clientX - this.startX; // 计算鼠标移动的距离
        this.asideWidth = Math.max(100, this.asideWidth + diffX); // 更新宽度，最小为100px
        this.startX = event.clientX; // 更新起始位置
      }
      console.log("isDragging:"+this.isDragging);
    },
    stopDrag() {
      if (this.isDragging) {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.stopDrag);
        console.log("stopDrag");
      }
    },
    handleNodeClick(data) {
      this.loadBookmarks(data.id);
    },
    loadBookmarks(treeId) {
      // 加载书签数据的逻辑
    },
    searchBookmarks() {
      console.log('搜索:', this.searchQuery);
    },
    addBookmark() {
      console.log('添加书签');
    }
  },
  mounted() {
    this.treeData = [
      { id: 1, title: '书签文件夹 1', children: [] },
      { id: 2, title: '书签文件夹 2', children: [] }
    ];
  }
};
</script>

