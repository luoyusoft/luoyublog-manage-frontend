<template>
  <el-dialog
    title="重置密码"
    :close-on-click-modal="false"
    :visible.sync="visible"
    :append-to-body="true">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="新密码" prop="password" class="is-required">
        <el-input v-model="dataForm.password" type="password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="comfirmPassword" class="is-required">
        <el-input v-model="dataForm.comfirmPassword" type="password" placeholder="确认密码"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { clearLoginInfo } from '@/utils'

export default {
  data () {
    var validatePassword = (rule, value, callback) => {
      if (value.length < 6 || value.length > 20) {
        callback(new Error('密码长度必须位于6到20之间'))
      } else {
        callback()
      }
    }
    var validateComfirmPassword = (rule, value, callback) => {
      if (this.dataForm.password !== value) {
        callback(new Error('确认密码与密码输入不一致'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      dataForm: {
        id: 0,
        password: ''
      },
      dataRule: {
        password: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ],
        comfirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { validator: validateComfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init (id) {
      this.dataForm.id = id
      this.visible = true
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/manage/sys/user/resetPassword`),
            method: 'put',
            data: this.$http.adornData({
              'id': this.dataForm.id,
              'password': this.dataForm.password
            })
          }).then((response) => {
            if (response && response.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  if (this.dataForm.id === this.$store.state.user.userId) {
                    this.$http({
                      url: this.$http.adornUrl('/manage/sys/logout'),
                      method: 'post',
                      data: this.$http.adornData()
                    }).then((response) => {
                      if (response && response.code === 200) {
                        clearLoginInfo()
                        this.$router.push({ name: 'login' })
                      }
                    })
                  } else {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
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
