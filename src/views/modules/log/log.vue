<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @submit.native.prevent>
      <el-form-item style="display: inline-block;width: 20%">
        <el-select v-model="dataForm.type" >
          <el-option v-for="type in typeList" :key="type.parKey" :value="type.parKey" :label="type.parValue"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查看</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      style="width: 100%;">
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        width="100px"
        label="ID">
      </el-table-column>
      <el-table-column
        prop="type"
        header-align="center"
        align="center"
        width="100px"
        label="类型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 'article'" size="small" type="success">文章</el-tag>
          <el-tag v-if="scope.row.type === 'video'" size="small" type="info">视频</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="method"
        header-align="center"
        treeKey="id"
        width="250px"
        label="请求方法">
      </el-table-column>
      <el-table-column
        prop="params"
        header-align="center"
        align="center"
        width="250px"
        label="请求参数">
      </el-table-column>
      <el-table-column
        prop="time"
        header-align="center"
        align="center"
        width="150px"
        label="执行时长(毫秒)">
      </el-table-column>
      <el-table-column
        prop="ip"
        header-align="center"
        align="center"
        width="200px"
        label="IP地址">
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        width="180px"
        label="创建时间">
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
      typeList: this.getSysParamArr('MODULE_TYPE'),
      dataForm: {
        type: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false
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
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/manage/log/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'type': this.dataForm.type
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
    }
  }
}
</script>
