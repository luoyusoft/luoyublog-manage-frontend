<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @submit.native.prevent>
      <el-form-item label="昵称">
        <el-input placeholder="昵称" v-model="dataForm.name" clearable></el-input>
      </el-form-item>
      <el-form-item label="楼层数">
        <el-input placeholder="楼层数" v-model="dataForm.floorNum" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button v-if="isAuth('messagewall:list')" @click="getDataList()">查看</el-button>
        <el-button v-if="isAuth('messagewall:add')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('messagewall:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="deleteHandle()">批量删除</el-button>
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
        fixed="left"
        prop="id"
        header-align="center"
        align="center"
        width="70px"
        label="id">
      </el-table-column>
      <el-table-column
        prop="profile"
        header-align="center"
        align="center"
        label="头像"
        width="100px">
        <template slot-scope="scope" >
          <div v-if="scope.row.profile !== null && scope.row.profile !== '' && scope.row.profile.startsWith('https://minio.jinhx.cc/img/')">
            <el-popover placement="top-start" title="" trigger="hover">
              <img :src="scope.row.profile" alt="" style="width: 300px;height: 300px">
              <img slot="reference" :src="scope.row.profile" style="width: 80px;height: 80px">
            </el-popover>
          </div>
          <div v-else>
            <p>暂不支持预览</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="floorNum"
        header-align="center"
        align="center"
        treeKey="id"
        width="100px"
        :show-overflow-tooltip="true"
        label="楼层数">
      </el-table-column>
      <el-table-column
        prop="replyId"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="回复id，-1为层主">
      </el-table-column>
      <el-table-column
        prop="name"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="昵称">
      </el-table-column>
      <el-table-column
        prop="comment"
        header-align="center"
        align="center"
        width="300px"
        :show-overflow-tooltip="true"
        label="内容">
      </el-table-column>
      <el-table-column
        prop="email"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="邮箱">
      </el-table-column>
      <el-table-column
        prop="website"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="网站">
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
        prop="createTime"
        header-align="center"
        align="center"
        min-width="180px"
        label="创建时间">
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        min-width="100px"
        label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('messagewall:add')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id, scope.row.floorNum)">回复</el-button>
          <el-button v-if="isAuth('messagewall:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
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
import AddOrUpdate from './messagewall-add-or-update'

export default {
  data () {
    return {
      dataForm: {
        floorNum: '',
        name: ''
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
          url: this.$http.adornUrl('/manage/messagewall'),
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
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/manage/messagewalls'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'floorNum': this.dataForm.floorNum,
          'name': this.dataForm.name
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
    // 新增 / 修改
    addOrUpdateHandle (id, floorNum) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id, floorNum)
      })
    }
  }
}
</script>
