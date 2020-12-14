<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="120px" @submit.native.prevent>
      <el-form-item>
        <el-popover placement="right"
                    width="500"
                    trigger="click"
                    v-model="isClose">
          <el-form :inline="true">
            <el-form-item style="display: inline-block;width: 20%">
              <el-select v-model="listParams.type" >
                <el-option v-for="type in typeList" :key="type.parKey" :value="type.parKey" :label="type.parValue"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="width: 35%">
              <el-input v-model="listParams.title" placeholder="标题"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="listRecommend()">查询</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="recommendList" style="height: 500px;overflow: auto">
            <el-table-column property="title" label="标题"></el-table-column>
            <el-table-column property="type"  label="类型">
              <template  slot-scope="scope" >
                {{getSysParam('MODULE_TYPE',scope.row.type,typeList)}}
              </template>
            </el-table-column>
            <el-table-column
              header-align="center"
              align="center"
              label="操作">
              <template slot-scope="scope">
                <el-button type="success" size="small" @click="selectRecommend(scope.row); close()">选择</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button slot="reference" @click="choose()" >请选择推荐内容</el-button>
        </el-popover>
      </el-form-item>
      <el-form-item label="标题" v-if="dataForm.title">
        {{dataForm.title}}
      </el-form-item>
      <el-form-item label="标题" v-if="!dataForm.title">
        请选择推荐内容
      </el-form-item>
      <el-form-item label="类型" v-if="getSysParam('MODULE_TYPE',dataForm.type,typeList)">
        {{getSysParam('MODULE_TYPE',dataForm.type,typeList)}}
      </el-form-item>
      <el-form-item label="类型" v-if="!getSysParam('MODULE_TYPE',dataForm.type,typeList)">
        请选择推荐内容
      </el-form-item>
      <el-form-item label="顺序" >
        <el-input v-model="dataForm.orderNum" type="number" placeholder="请输入顺序"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()" :disabled="confirmButtonDisabled">确定</el-button>
    </span>
  </el-dialog>
</template>

<style>
.el-popover{
  height: 650px;
  overflow: auto;
}
</style>

<script>
export default {
  data () {
    return {
      visible: false,
      confirmButtonDisabled: false,
      dataForm: {},
      dataRule: {
        linkId: [{ required: true, message: '推荐的文章Id不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '推荐类型不能为空', trigger: 'blur' }]
      },
      recommendListShow: false,
      recommendList: [],
      typeList: this.getSysParamArr('MODULE_TYPE'),
      listParams: {
        title: '',
        type: 0
      },
      isClose: false
    }
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
    // 关闭弹框的事件
    close () {
      this.isClose = false
    },
    choose () {
      this.recommendListShow = true
      this.listRecommend()
    },
    keyDown () {
      // 13代表回车键
      if (window.event.keyCode === 13) {
        this.listRecommend()
      }
    },
    init (id) {
      this.dataForm.id = id || ''
      this.visible = true
      this.confirmButtonDisabled = false
      this.$nextTick(() => {
        if (this.$refs['dataForm'] !== undefined) {
          this.$refs['dataForm'].resetFields()
        }
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/manage/operation/recommend/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then((response) => {
            if (response && response.code === 200) {
              this.dataForm = response.data
            }
          })
        } else {
          this.dataForm = {}
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/manage/operation/recommend/${!this.dataForm.id ? 'save' : 'update'}`),
            method: !this.dataForm.id ? 'post' : 'put',
            data: this.$http.adornData(this.dataForm)
          }).then((response) => {
            this.confirmButtonDisabled = true
            if (response && response.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1000,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              this.$message.error(response.msg)
            }
          })
        }
      })
    },
    listRecommend () {
      this.$http({
        url: this.$http.adornUrl(`/manage/operation/recommend/select`),
        method: 'get',
        params: this.$http.adornParams(this.listParams)
      }).then((response) => {
        if (response && response.code === 200) {
          this.recommendList = response.data
        }
      })
    },
    selectRecommend (recommend) {
      this.dataForm.linkId = recommend.linkId
      this.dataForm.title = recommend.title
      this.dataForm.type = recommend.type
      this.recommendListShow = false
    }
  }
}
</script>
