<template>
  <div class="mod-config">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-form :inline="true" :model="dataForm" @submit.native.prevent>
        <el-collapse-item title="更多条件" name="1" style="margin-bottom: 12px">
          <el-form-item label="文件的md5">
            <el-input placeholder="文件的md5" v-model="dataForm.fileMd5" clearable></el-input>
          </el-form-item>
          <el-form-item label="文件所属模块">
            <el-select v-model="dataForm.module" clearable>
              <el-option v-for="module in moduleList" :key="module.parKey" :value="module.parKey" :label="module.parValue"></el-option>
            </el-select>
          </el-form-item>
        </el-collapse-item>
        <el-form-item label="文件名称">
          <el-input placeholder="文件名称" v-model="dataForm.fileName" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="getDataList()">查看</el-button>
          <el-button type="danger" :disabled="dataListSelections.length <= 0" @click="deleteHandle()">批量删除</el-button>
        </el-form-item>
      </el-form>
    </el-collapse>
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
        prop="module"
        header-align="center"
        align="center"
        width="100px"
        label="模块">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.module === 0" size="small" type="success">文章</el-tag>
          <el-tag v-if="scope.row.module === 1" size="small" type="warning">视频</el-tag>
          <el-tag v-if="scope.row.module === 2" size="small" type="error">友链</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="cover"
        header-align="center"
        align="center"
        label="预览"
        width="150px">
        <template slot-scope="scope" >
          <div v-if="scope.row.url !== null && scope.row.url !== '' && scope.row.url.startsWith('https://minio.luoyublog.com/img/')">
            <el-popover placement="top-start" title="" trigger="hover">
              <img :src="scope.row.url" alt="" style="width: 300px;height: 300px">
              <img slot="reference" :src="scope.row.url" style="width: 120px;height: 120px">
            </el-popover>
          </div>
          <div v-else>
            <p>暂不支持预览</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="fileName"
        header-align="center"
        align="center"
        treeKey="id"
        width="200px"
        :show-overflow-tooltip="true"
        label="文件名称">
      </el-table-column>
      <el-table-column
        prop="url"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="url地址">
      </el-table-column>
      <el-table-column
        prop="storageType"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="存储类型">
      </el-table-column>
      <el-table-column
        prop="bucketName"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="桶名">
      </el-table-column>
      <el-table-column
        prop="fileMd5"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="文件的md5">
      </el-table-column>
      <el-table-column
        prop="fileSize"
        header-align="center"
        align="center"
        width="100px"
        :show-overflow-tooltip="true"
        label="文件大小">
      </el-table-column>
      <el-table-column
        prop="suffix"
        header-align="center"
        align="center"
        width="100px"
        :show-overflow-tooltip="true"
        label="文件格式">
      </el-table-column>
      <el-table-column
        prop="isChunk"
        header-align="center"
        align="center"
        width="100px"
        :show-overflow-tooltip="true"
        label="是否分片">
      </el-table-column>
      <el-table-column
        prop="chunkCount"
        header-align="center"
        align="center"
        width="100px"
        :show-overflow-tooltip="true"
        label="分片总数量">
      </el-table-column>
      <el-table-column
        prop="uploadStatus"
        header-align="center"
        align="center"
        width="100px"
        :show-overflow-tooltip="true"
        label="上传状态">
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
      moduleList: [
        {
          parKey: '0',
          parValue: '文章'
        },
        {
          parKey: '1',
          parValue: '视频'
        },
        {
          parKey: '2',
          parValue: '友链'
        }
      ],
      dataForm: {
        module: '',
        fileName: '',
        fileMd5: ''
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
          url: this.$http.adornUrl('/manage/file/minio/file'),
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
        url: this.$http.adornUrl('/manage/file/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'fileName': this.dataForm.fileName,
          'fileMd5': this.dataForm.fileMd5,
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
