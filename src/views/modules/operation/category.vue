<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @submit.native.prevent>
      <el-form-item label="模块">
        <el-select v-model="dataForm.module" clearable>
          <el-option v-for="module in moduleList"
          :key="module.parKey"
          :value="module.parKey"
          :label="module.parValue"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="dataForm.name" placeholder="名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button v-if="isAuth('operation:category:delete')" @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('operation:category:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
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
            <el-form-item label="名称：">
              <span>{{ scope.row.name }}</span>
            </el-form-item>
            <el-form-item label="模块：">
              <el-tag v-if="scope.row.module === 0" size="small" type="success">文章</el-tag>
              <el-tag v-if="scope.row.module === 1" size="small" type="warning">视频</el-tag>
              <!--          {{getSysParam('MODULE_TYPE',scope.row.type,typeList)}}-->
            </el-form-item>
            <el-form-item label="级别：">
              {{getSysParam('CATEGORY_RANK', scope.row.rank)}}
            </el-form-item>
            <el-form-item label="上级级别：">
              <span>{{ scope.row.parentName }}</span>
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
              <el-button v-if="isAuth('operation:category:update')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
              <el-button v-if="isAuth('operation:category:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
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
      <table-tree-column
        prop="name"
        header-align="center"
        width="250px"
        :show-overflow-tooltip="true"
        label="名称">
      </table-tree-column>
      <el-table-column
        prop="module"
        header-align="center"
        align="center"
        width="100px"
        label="模块">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.module === 0" size="small" type="success">文章</el-tag>
          <el-tag v-if="scope.row.module === 1" size="small" type="warning">视频</el-tag>
<!--          {{getSysParam('MODULE_TYPE',scope.row.type,typeList)}}-->
        </template>
      </el-table-column>
      <el-table-column
        prop="rank"
        header-align="center"
        align="center"
        width="100px"
        :show-overflow-tooltip="true"
        label="级别">
        <template slot-scope="scope">
          {{getSysParam('CATEGORY_RANK', scope.row.rank)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="parentName"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="上级级别">
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
          <el-button v-if="isAuth('operation:category:update')" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
          <el-button v-if="isAuth('operation:category:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import TableTreeColumn from '@/components/table-tree-column'
import AddOrUpdate from './category-add-or-update'
import { treeDataTranslate } from '@/utils'
export default {
  data () {
    return {
      dataForm: {
        name: '',
        module: ''
      },
      dataList: [],
      dataListLoading: false,
      addOrUpdateVisible: false,
      moduleList: this.getSysParamArr('MODULE_TYPE')
    }
  },
  components: {
    AddOrUpdate,
    TableTreeColumn
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
    // 获取数据列表
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/manage/operation/category/list'),
        method: 'get',
        params: this.$http.adornParams({
          name: this.dataForm.name,
          module: this.dataForm.module
        })
      }).then((response) => {
        if (response && response.code === 200) {
          this.dataList = treeDataTranslate(response.data)
        } else {
          this.dataList = []
        }
        this.dataListLoading = false
      })
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
      this.$confirm(`确定对[id=${id}]进行删除操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/manage/operation/category/delete/' + id),
          method: 'delete',
          data: this.$http.adornData()
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
