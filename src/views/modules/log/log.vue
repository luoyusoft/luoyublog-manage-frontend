<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @submit.native.prevent>
      <el-form-item style="display: inline-block">
        <el-select v-model="dataForm.module" >
          <el-option v-for="module in moduleList" :key="module.parKey" :value="module.parKey" :label="module.parValue"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查看</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      height="800"
      style="width: 100%;">
      <el-table-column
        fixed="left"
        prop="id"
        header-align="center"
        align="center"
        width="70px"
        label="id">
      </el-table-column>
      <el-table-column
        prop="module"
        header-align="center"
        align="center"
        width="100px"
        label="模块">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.module === 0" size="small" type="success">文章</el-tag>
          <el-tag v-if="scope.row.module === 1" size="small" type="warning">视频</el-tag>
          <el-tag v-if="scope.row.module === 2" size="small" type="error">聊天室</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="method"
        header-align="center"
        treeKey="id"
        width="250px"
        show-overflow-tooltip="true"
        label="请求方法">
      </el-table-column>
      <el-table-column
        prop="uri"
        header-align="center"
        align="center"
        width="200px"
        show-overflow-tooltip="true"
        label="请求uri">
      </el-table-column>
      <el-table-column
        prop="requestType"
        header-align="center"
        align="center"
        width="150px"
        show-overflow-tooltip="true"
        label="请求类型">
      </el-table-column>
      <el-table-column
        prop="headrParams"
        header-align="center"
        align="center"
        width="300px"
        show-overflow-tooltip="true"
        label="请求头参数">
      </el-table-column>
      <el-table-column
        prop="bodyParams"
        header-align="center"
        align="center"
        width="400px"
        show-overflow-tooltip="true"
        label="请求体参数">
      </el-table-column>
      <el-table-column
        prop="response"
        header-align="center"
        align="center"
        width="600px"
        show-overflow-tooltip="true"
        label="响应结果">
      </el-table-column>
      <el-table-column
        prop="time"
        header-align="center"
        align="center"
        width="150px"
        show-overflow-tooltip="true"
        label="执行时长(毫秒)">
      </el-table-column>
      <el-table-column
        prop="ip"
        header-align="center"
        align="center"
        width="200px"
        show-overflow-tooltip="true"
        label="ip地址">
      </el-table-column>
      <el-table-column
        prop="country"
        header-align="center"
        align="center"
        width="150px"
        show-overflow-tooltip="true"
        label="国家">
      </el-table-column>
      <el-table-column
        prop="region"
        header-align="center"
        align="center"
        width="150px"
        show-overflow-tooltip="true"
        label="省份">
      </el-table-column>
      <el-table-column
        prop="city"
        header-align="center"
        align="center"
        width="150px"
        show-overflow-tooltip="true"
        label="城市">
      </el-table-column>
      <el-table-column
        prop="borderName"
        header-align="center"
        align="center"
        width="200px"
        show-overflow-tooltip="true"
        label="浏览器名字">
      </el-table-column>
      <el-table-column
        prop="borderVersion"
        header-align="center"
        align="center"
        width="200px"
        show-overflow-tooltip="true"
        label="浏览器版本">
      </el-table-column>
      <el-table-column
        prop="deviceManufacturer"
        header-align="center"
        align="center"
        width="200px"
        show-overflow-tooltip="true"
        label="设备生产厂商">
      </el-table-column>
      <el-table-column
        prop="deviceType"
        header-align="center"
        align="center"
        width="200px"
        show-overflow-tooltip="true"
        label="设备类型">
      </el-table-column>
      <el-table-column
        prop="osVersion"
        header-align="center"
        align="center"
        width="200px"
        show-overflow-tooltip="true"
        label="操作系统的版本号">
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
      moduleList: this.getSysParamArr('MODULE_TYPE'),
      dataForm: {
        module: ''
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
          'module': this.dataForm.module
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
