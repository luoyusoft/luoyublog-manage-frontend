<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @submit.native.prevent>
      <el-form-item style="display: inline-block">
        <el-select v-model="dataForm.module" clearable>
          <el-option v-for="module in moduleList" :key="module.parKey" :value="module.parKey" :label="module.parValue"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-if="isAuth('log:list')" @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
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
            <el-form-item label="模块：">
              <el-tag v-if="scope.row.module === 0" size="small" type="success">文章</el-tag>
              <el-tag v-if="scope.row.module === 1" size="small" type="warning">视频</el-tag>
              <el-tag v-if="scope.row.module === 2" size="small" type="error">聊天室</el-tag>
              <el-tag v-if="scope.row.module === 3" size="small" type="error">搜索</el-tag>
              <el-tag v-if="scope.row.module === 4" size="small" type="error">时间线</el-tag>
              <el-tag v-if="scope.row.module === 5" size="small" type="error">留言墙</el-tag>
            </el-form-item>
            <el-form-item label="请求方法：">
              <span>{{ scope.row.method }}</span>
            </el-form-item>
            <el-form-item label="请求uri：">
              <span>{{ scope.row.uri }}</span>
            </el-form-item>
            <el-form-item label="请求类型：">
              <span>{{ scope.row.requestType }}</span>
            </el-form-item>
            <el-form-item label="请求头参数：">
              <span>{{ scope.row.headrParams }}</span>
            </el-form-item>
            <el-form-item label="请求体参数：">
              <span>{{ scope.row.bodyParams }}</span>
            </el-form-item>
            <el-form-item label="响应结果：">
              <p style="display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 3;overflow: hidden">{{ scope.row.response }}</p>
            </el-form-item>
            <el-form-item label="执行时长（毫秒）：">
              <span>{{ scope.row.time }}</span>
            </el-form-item>
            <el-form-item label="ip地址：">
              <span>{{ scope.row.ip }}</span>
            </el-form-item>
            <el-form-item label="国家：">
              <span>{{ scope.row.country }}</span>
            </el-form-item>
            <el-form-item label="省份：">
              <span>{{ scope.row.region }}</span>
            </el-form-item>
            <el-form-item label="城市：">
              <span>{{ scope.row.city }}</span>
            </el-form-item>
            <el-form-item label="浏览器名字：">
              <span>{{ scope.row.borderName }}</span>
            </el-form-item>
            <el-form-item label="浏览器版本：">
              <span>{{ scope.row.borderVersion }}</span>
            </el-form-item>
            <el-form-item label="设备生产厂商：">
              <span>{{ scope.row.deviceManufacturer }}</span>
            </el-form-item>
            <el-form-item label="设备类型：">
              <span>{{ scope.row.deviceType }}</span>
            </el-form-item>
            <el-form-item label="操作系统的版本号：">
              <span>{{ scope.row.osVersion }}</span>
            </el-form-item>
            <el-form-item label="创建时间：">
              <span>{{ scope.row.createTime }}</span>
            </el-form-item>
            <el-form-item label="更新时间：">
              <span>{{ scope.row.updateTime }}</span>
            </el-form-item>
          </el-form>
        </template>
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
        prop="module"
        header-align="center"
        align="center"
        width="100px"
        label="模块">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.module === 0" size="small" type="success">文章</el-tag>
          <el-tag v-if="scope.row.module === 1" size="small" type="warning">视频</el-tag>
          <el-tag v-if="scope.row.module === 2" size="small" type="error">聊天室</el-tag>
          <el-tag v-if="scope.row.module === 3" size="small" type="error">搜索</el-tag>
          <el-tag v-if="scope.row.module === 4" size="small" type="error">时间线</el-tag>
          <el-tag v-if="scope.row.module === 5" size="small" type="error">留言墙</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="method"
        header-align="center"
        treeKey="id"
        width="250px"
        :show-overflow-tooltip="true"
        label="请求方法">
      </el-table-column>
      <el-table-column
        prop="uri"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="请求uri">
      </el-table-column>
      <el-table-column
        prop="requestType"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="请求类型">
      </el-table-column>
      <el-table-column
        prop="headrParams"
        header-align="center"
        align="center"
        width="300px"
        :show-overflow-tooltip="true"
        label="请求头参数">
      </el-table-column>
      <el-table-column
        prop="bodyParams"
        header-align="center"
        align="center"
        width="400px"
        :show-overflow-tooltip="true"
        label="请求体参数">
      </el-table-column>
      <el-table-column
        prop="response"
        header-align="center"
        align="center"
        width="600px"
        :show-overflow-tooltip="true"
        label="响应结果">
      </el-table-column>
      <el-table-column
        prop="time"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="执行时长（毫秒）">
      </el-table-column>
      <el-table-column
        prop="ip"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="ip地址">
      </el-table-column>
      <el-table-column
        prop="country"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="国家">
      </el-table-column>
      <el-table-column
        prop="region"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="省份">
      </el-table-column>
      <el-table-column
        prop="city"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="城市">
      </el-table-column>
      <el-table-column
        prop="borderName"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="浏览器名字">
      </el-table-column>
      <el-table-column
        prop="borderVersion"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="浏览器版本">
      </el-table-column>
      <el-table-column
        prop="deviceManufacturer"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="设备生产厂商">
      </el-table-column>
      <el-table-column
        prop="deviceType"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="设备类型">
      </el-table-column>
      <el-table-column
        prop="osVersion"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="操作系统的版本号">
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
        prop="updateTime"
        header-align="center"
        align="center"
        width="180px"
        label="更新时间">
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
      pageSize: 20,
      totalPage: 0,
      dataListLoading: false
    }
  },
  created () {
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
