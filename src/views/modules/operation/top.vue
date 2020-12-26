<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button v-if="isAuth('operation:top:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('operation:top:delete')" type="danger" @click="deleteHandle()"
                   :disabled="dataListSelections.length <= 0">批量删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;">
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50px">
      </el-table-column>
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        width="100px"
        label="id">
      </el-table-column>
      <el-table-column
        prop="title"
        header-align="center"
        align="center"
        width="300px"
        label="标题">
      </el-table-column>
      <el-table-column
        prop="type"
        header-align="center"
        align="center"
        width="100px"
        label="类型">
        <template slot-scope="scope">
          {{ getSysParam('MODULE_TYPE', scope.row.type) }}
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
        header-align="center"
        align="center"
        width="150px"
        label="置顶">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="置顶" v-if="scope.row.orderNum !== 1" placement="top">
            <el-button type="info" size="mini" @click="updateTop(scope.row.id)">未置顶</el-button>
          </el-tooltip>
          <el-button type="success" size="mini" v-if="scope.row.orderNum === 1">已置顶</el-button>
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
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from './top-add-or-update'

export default {
  data () {
    return {
      dataForm: {
        title: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    }
  },
  components: {
    AddOrUpdate
  },
  activated () {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/manage/operation/top/list'),
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
          url: this.$http.adornUrl('/manage/operation/top/delete'),
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
      this.$confirm(`确定对[id=${id}]进行[置顶]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/manage/operation/top/top/' + id),
          method: 'put',
          data: this.$http.adornData()
        }).then((response) => {
          if (response && response.code === 200) {
            this.$message.success('置顶成功')
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
