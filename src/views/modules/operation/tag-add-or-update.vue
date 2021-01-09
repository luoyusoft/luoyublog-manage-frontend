<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
      <el-form-item label="标签名称" prop="name">
        <el-input v-model="dataForm.name" placeholder="标签名字"></el-input>
      </el-form-item>
      <el-form-item label="所属模块" prop="module">
        <el-select v-model="dataForm.module">
          <el-option
            v-for="module in moduleList"
            :key="module.parKey"
            :value="module.parKey"
            :label="module.parValue"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()" :disabled="confirmButtonDisabled">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      visible: false,
      confirmButtonDisabled: false,
      dataForm: {
        module: ''
      },
      dataRule: {
        name: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
        module: [{ required: true, message: '所属模块不能为空', trigger: 'blur' }]
      },
      moduleList: this.getSysParamArr('MODULE_TYPE')
    }
  },
  methods: {
    init (id) {
      this.dataForm.id = id || ''
      this.visible = true
      this.confirmButtonDisabled = false
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.$http({
            url: this.$http.adornUrl(`/manage/operation/tag/info/${this.dataForm.id}`),
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
            url: this.$http.adornUrl(`/manage/operation/tag/${!this.dataForm.id ? 'save' : 'update'}`),
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
    }
  }
}
</script>
