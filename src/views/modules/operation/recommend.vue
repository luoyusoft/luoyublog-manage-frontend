<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button v-if="isAuth('operation:recommend:list')" @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('operation:recommend:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('operation:recommend:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除
        </el-button>
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
        type="expand"
        header-align="center"
        align="center"
        width="50px">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="id：">
              <span>{{ scope.row.id }}</span>
            </el-form-item>
            <el-form-item label="推荐标题：">
              <span>{{ scope.row.title }}</span>
            </el-form-item>
            <el-form-item label="推荐模块：">
              <el-tag v-if="scope.row.module === 0" size="small" type="success">文章</el-tag>
              <el-tag v-if="scope.row.module === 1" size="small" type="warning">视频</el-tag>
              <!--          {{ getSysParam('MODULE_TYPE', scope.row.type) }}-->
            </el-form-item>
            <el-form-item label="顺序：">
              <span>{{ scope.row.orderNum }}</span>
            </el-form-item>
            <el-form-item v-if="isAuth('operation:recommend:update')" label="推荐置顶：">
              <el-tooltip class="item" effect="dark" content="推荐置顶" v-if="scope.row.orderNum !== 1" placement="top">
                <el-button type="info" size="mini" @click="updateTop(scope.row.id)">未置顶</el-button>
              </el-tooltip>
              <el-button type="success" size="mini" v-if="scope.row.orderNum === 1">已置顶</el-button>
            </el-form-item>
            <el-form-item v-else label="推荐置顶：">
                <span v-if="scope.row.orderNum !== 1">未置顶</span>
                <span v-else>已置顶</span>
            </el-form-item>
            <el-form-item label="创建者id：">
              <span>{{ scope.row.createrId }}</span>
            </el-form-item>
            <el-form-item label="更新者id：">
              <span>{{ scope.row.updaterId }}</span>
            </el-form-item>
            <el-form-item label="创建时间：">
              <span>{{ scope.row.createTime }}</span>
            </el-form-item>
            <el-form-item label="更新时间：">
              <span>{{ scope.row.updateTime }}</span>
            </el-form-item>
            <el-form-item label="操作：">
              <el-button v-if="isAuth('operation:recommend:update')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
              <el-button v-if="isAuth('operation:recommend:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        fixed="left"
        type="selection"
        header-align="center"
        align="center"
        width="50px">
      </el-table-column>
      <el-table-column
        fixed="left"
        prop="id"
        header-align="center"
        align="center"
        width="70px"
        label="id">
      </el-table-column>
      <el-table-column
        prop="title"
        header-align="center"
        align="center"
        width="300px"
        :show-overflow-tooltip="true"
        label="推荐标题">
      </el-table-column>
      <el-table-column
        prop="module"
        header-align="center"
        align="center"
        width="100px"
        label="推荐模块">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.module === 0" size="small" type="success">文章</el-tag>
          <el-tag v-if="scope.row.module === 1" size="small" type="warning">视频</el-tag>
<!--          {{ getSysParam('MODULE_TYPE', scope.row.type) }}-->
        </template>
      </el-table-column>
      <el-table-column
        prop="orderNum"
        header-align="center"
        align="center"
        width="100px"
        label="顺序">
      </el-table-column>
      <el-table-column
        v-if="isAuth('operation:recommend:update')"
        header-align="center"
        align="center"
        width="150px"
        label="推荐置顶">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="推荐置顶" v-if="scope.row.orderNum !== 1" placement="top">
            <el-button type="info" size="mini" @click="updateTop(scope.row.id)">未置顶</el-button>
          </el-tooltip>
          <el-button type="success" size="mini" v-if="scope.row.orderNum === 1">已置顶</el-button>
        </template>
      </el-table-column>
      <el-table-column
        v-else
        header-align="center"
        align="center"
        width="150px"
        label="推荐置顶">
        <template slot-scope="scope">
          <span v-if="scope.row.orderNum !== 1">未置顶</span>
          <span v-else>已置顶</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="createrId"
        header-align="center"
        align="center"
        width="100px"
        label="创建者id">
      </el-table-column>
      <el-table-column
        prop="updaterId"
        header-align="center"
        align="center"
        width="100px"
        label="更新者id">
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
          <el-button v-if="isAuth('operation:recommend:update')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
          <el-button v-if="isAuth('operation:recommend:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
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
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from './recommend-add-or-update'

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
      dataListSelections: [],
      addOrUpdateVisible: false
    }
  },
  components: {
    AddOrUpdate
  },
  created () {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/manage/operation/recommend/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize
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
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id)
      })
    },
    // 删除
    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })
      this.$confirm(`确定对这${ids.length}条数据进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/manage/operation/recommend/delete'),
          method: 'delete',
          data: this.$http.adornData(ids, false)
        }).then((response) => {
          if (response && response.code === 200) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1000,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    updateTop (id) {
      this.$confirm(`确定对[id=${id}]进行[推荐置顶]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/manage/operation/recommend/top/' + id),
          method: 'put',
          data: this.$http.adornData()
        }).then((response) => {
          if (response && response.code === 200) {
            this.$message.success('推荐置顶成功')
            this.getDataList()
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-left: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
