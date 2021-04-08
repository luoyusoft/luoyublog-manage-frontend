<template>
<div>
  <el-form :inline="true">
    <el-form-item>
      <el-input placeholder="文章标题" v-model="dataForm.title" clearable></el-input>
    </el-form-item>
    <el-form-item>
      <el-button @click="getDataList()">查询</el-button>
      <el-button type="danger" :disabled="dataListSelections.length <= 0" @click="deleteHandle()">批量删除</el-button>
      <el-button type="warning"  @click="refreshCache()">刷新缓存</el-button>
    </el-form-item>
  </el-form>
  <el-table
    :data="dataList"
    border
    v-loading="dataListLoading"
    @selection-change="selectionChangeHandle"
    height="800"
    style="width: 100%;">
    <el-table-column
      fixed="left"
      type="selection"
      header-align="center"
      align="center"
      width="50px">
    </el-table-column>
    <el-table-column
      prop="id"
      fixed="left"
      header-align="center"
      align="center"
      width="70px"
      label="id">
    </el-table-column>
    <el-table-column
      prop="cover"
      header-align="center"
      align="center"
      label="封面"
      width="150px">
      <template slot-scope="scope" >
        <div v-if="scope.row.cover !== null && scope.row.cover !== ''">
          <el-popover placement="top-start" title="" trigger="hover">
            <img :src="scope.row.cover" alt="" style="width: 300px;height: 250px">
            <img slot="reference" :src="scope.row.cover" style="width: 120px;height: 100px">
          </el-popover>
        </div>
        <div v-else>
            <p>暂无封面</p>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="title"
      header-align="center"
      align="center"
      label="文章标题"
      :show-overflow-tooltip="true"
      width="250px">
    </el-table-column>
    <el-table-column
      prop="description"
      header-align="center"
      align="center"
      label="文章简介"
      :show-overflow-tooltip="true"
      width="250px">
    </el-table-column>
    <el-table-column
      prop="author"
      header-align="center"
      align="center"
      width="100px"
      :show-overflow-tooltip="true"
      label="作者">
    </el-table-column>
    <el-table-column
      prop="categoryListStr"
      header-align="center"
      align="center"
      :show-overflow-tooltip="true"
      label="分类"
      width="200px">
    </el-table-column>
    <el-table-column
      prop="tagList"
      header-align="center"
      align="center"
      label="标签"
      width="300px">
      <template slot-scope="scope">
        <el-row>
          <el-button style="margin-top: 8px" v-for="tag in scope.row.tagList" :key="tag.id" size="mini">{{tag.name}}</el-button>
        </el-row>
      </template>
    </el-table-column>
    <el-table-column
      prop="readNum"
      header-align="center"
      align="center"
      width="100px"
      label="阅读量">
    </el-table-column>
    <el-table-column
      prop="likeNum"
      header-align="center"
      align="center"
      width="100px"
      label="点赞量">
    </el-table-column>
    <el-table-column
      prop="commentNum"
      header-align="center"
      align="center"
      width="100px"
      label="评论量">
    </el-table-column>
    <el-table-column
      prop="publish"
      header-align="center"
      align="center"
      width="100px"
      label="状态">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" content="点击发布" v-if="!scope.row.publish" placement="top">
          <el-button type="info" size="mini" @click="updatePublish(scope.row.id, true)">未发布</el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="点击下架" v-if="scope.row.publish" placement="top">
          <el-button type="success" size="mini" @click="updatePublish(scope.row.id, false)" v-if="scope.row.publish === true">已发布</el-button>
        </el-tooltip>
      </template>
    </el-table-column>
    <el-table-column
      prop="recommend"
      header-align="center"
      align="center"
      min-width="100px"
      label="推荐">
      <template slot-scope="scope">
        <el-switch
          v-model="scope.row.recommend"
          active-color="#13ce66"
          @change="updateRecommend(scope.row.id,scope.row.recommend)">
        </el-switch>
      </template>
    </el-table-column>
    <el-table-column
      prop="createTime"
      header-align="center"
      align="center"
      width="180px"
      label="创建时间">
    </el-table-column>
    <el-table-column
      prop="updateTime"
      header-align="center"
      align="center"
      width="180px"
      label="更新时间">
    </el-table-column>
    <el-table-column
      fixed="right"
      header-align="center"
      align="center"
      min-width="100px"
      label="操作">
      <template slot-scope="scope">
        <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
        <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    @size-change="sizeChangeHandle"
    @current-change="currentChangeHandle"
    :current-page="pageIndex"
    :page-sizes="[10, 20, 50, 100]"
    :page-size="pageSize"
    :total="totalPage"
    layout="total, sizes, prev, pager, next, jumper">
  </el-pagination>
</div>
</template>

<script>
export default {
  data () {
    return {
      dataForm: {
        title: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 20,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: []
    }
  },
  activated () {
    this.getDataList()
  },
  beforeDestroy () {
    // 移除监听器
    document.removeEventListener('keydown', this.keyDown)
  },
  mounted () {
    // 监听回车键
    document.addEventListener('keydown', this.keyDown)
  },
  methods: {
    keyDown () {
      // 13代表回车键
      if (window.event.keyCode === 13) {
        this.getDataList()
      }
    },
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/manage/article/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'title': this.dataForm.title
        })
      }).then((response) => {
        if (response && response.code === 200) {
          this.dataList = response.data.list
          this.totalPage = response.data.totalCount
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },
    // 每页数
    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },
    // 当前页
    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },
    // 多选
    selectionChangeHandle (val) {
      this.dataListSelections = val
    },
    // 新增 / 修改
    addOrUpdateHandle (id) {
      this.$router.replace({path: 'article/article/update/' + id})
    },
    // 删除
    deleteHandle (id) {
      let ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })
      this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/manage/article/delete'),
          method: 'delete',
          data: this.$http.adornData(ids, false)
        }).then((response) => {
          if (response && response.code === 200) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {})
    },
    // 更新文章推荐状态
    updateRecommend (id, value) {
      let data = {
        id: id,
        recommend: value
      }
      this.updateStatus(data)
    },
    // 更新文章置顶状态
    updateTop (id, value) {
      let data = {
        id: id,
        top: value
      }
      this.updateStatus(data)
    },
    // 更新文章发布状态
    updatePublish (id, value) {
      let data = {
        id: id,
        publish: value
      }
      this.updateStatus(data)
    },
    // 更新文章
    updateStatus (data) {
      this.$http({
        url: this.$http.adornUrl(`/manage/article/update/status`),
        method: 'put',
        data: this.$http.adornData(data)
      }).then((response) => {
        if (response && response.code === 200) {
          this.$message.success('更新成功')
          this.getDataList()
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    // 刷新缓存
    refreshCache () {
      this.$http({
        url: this.$http.adornUrl(`/manage/article/cache/refresh`),
        method: 'delete'
      }).then((response) => {
        if (response && response.code === 200) {
          this.$message.success('刷新成功')
        } else {
          this.$message.error(response.msg)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
