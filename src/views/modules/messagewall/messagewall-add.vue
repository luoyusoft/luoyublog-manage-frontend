<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '回复'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
      <el-form-item label="内容" prop="comment">
        <el-input v-model="dataForm.comment" placeholder="内容"></el-input>
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
      },
      dataRule: {
        comment: [{ required: true, message: '内容不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    init (id, floorNum) {
      this.dataForm.id = id || ''
      this.dataForm.replyId = id
      this.dataForm.floorNum = floorNum
      this.visible = true
      this.confirmButtonDisabled = false
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl('/manage/messagewall'),
            method: 'post',
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
