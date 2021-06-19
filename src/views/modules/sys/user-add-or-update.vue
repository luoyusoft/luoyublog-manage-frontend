<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    :append-to-body="true">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="用户名" prop="newUsername">
        <el-input v-model="dataForm.newUsername" placeholder="用户名"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="dataForm.nickname" placeholder="昵称"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dataForm.email" placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="dataForm.mobile" placeholder="手机"></el-input>
      </el-form-item>
      <el-form-item label="上传头像">
        <el-col :span="12">
          <el-upload
            drag
            :action="url"
            list-type="picture"
            :multiple="false"
            :before-upload="beforeUploadHandle"
            :file-list="file"
            :on-remove="handleRemove"
            :on-success="successHandle">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">暂时只支持jpg、png、gif格式的图片！</div>
          </el-upload>
        </el-col>
      </el-form-item>
      <el-form-item label="角色" size="mini" prop="roleIdList">
        <el-checkbox-group v-model="dataForm.roleIdList">
          <el-checkbox v-for="role in roleList" :key="role.id" :label="role.id">{{ role.roleName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label="0">禁用</el-radio>
          <el-radio :label="1">正常</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { isEmail, isMobile } from '@/utils/validate'
export default {
  data () {
    // eslint-disable-next-line no-unused-vars
    var validateNickname = (rule, value, callback) => {
      if (value.length < 2 || value.length > 20) {
        callback(new Error('昵称长度必须位于2到20之间'))
      } else {
        callback()
      }
    }
    // eslint-disable-next-line no-unused-vars
    var validateUsername = (rule, value, callback) => {
      if (value.length < 4 || value.length > 20) {
        callback(new Error('用户名长度必须位于4到20之间'))
      } else {
        callback()
      }
    }
    var validateEmail = (rule, value, callback) => {
      if (value) {
        if (!isEmail(value)) {
          callback(new Error('邮箱格式错误'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    var validateMobile = (rule, value, callback) => {
      if (value) {
        if (!isMobile(value)) {
          callback(new Error('手机号格式错误'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      visible: false,
      roleList: [],
      dataForm: {
        id: 0,
        newUsername: '',
        salt: '',
        nickname: '',
        profile: '',
        email: '',
        mobile: '',
        roleIdList: [],
        status: 1
      },
      url: this.$http.adornUrl(`/manage/file/minio/upload?token=${this.$cookie.get('token')}&module=4`),
      file: [],
      dataRule: {
        newUsername: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { validator: validateUsername, trigger: 'blur' }
        ],
        email: [
          // { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          // { required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '昵称不能为空', trigger: 'blur' },
          { validator: validateNickname, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init (id) {
      this.dataForm.id = id
      this.$http({
        url: this.$http.adornUrl('/manage/sys/role/select'),
        method: 'get',
        params: this.$http.adornParams()
      }).then((response) => {
        this.roleList = response && response.code === 200 ? response.data : []
      }).then(() => {
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
        })
      }).then(() => {
        if (this.dataForm.id !== null) {
          this.$http({
            url: this.$http.adornUrl(`/manage/sys/user/info/${this.dataForm.id}`),
            method: 'get',
            params: this.$http.adornParams()
          }).then((response) => {
            if (response && response.code === 200) {
              this.dataForm.newUsername = response.data.username
              this.dataForm.salt = response.data.salt
              this.dataForm.email = response.data.email
              this.dataForm.roleIdList = response.data.roleIdList
              this.dataForm.status = response.data.status
              this.dataForm.nickname = response.data.nickname
              this.dataForm.profile = response.data.profile
              this.dataForm.mobile = response.data.mobile
              this.file = [{url: response.data.profile}]
            }
          })
        } else {
          this.dataForm.newUsername = ''
          this.dataForm.salt = ''
          this.dataForm.email = ''
          this.dataForm.roleIdList = []
          this.dataForm.status = 1
          this.dataForm.nickname = ''
          this.dataForm.profile = ''
          this.dataForm.mobile = ''
          this.file = []
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/manage/sys/user/${!this.dataForm.id ? 'save' : 'update'}`),
            method: !this.dataForm.id ? 'post' : 'put',
            data: this.$http.adornData({
              'id': this.dataForm.id || undefined,
              'username': this.dataForm.newUsername,
              'salt': this.dataForm.salt,
              'email': this.dataForm.email,
              'mobile': this.dataForm.mobile,
              'profile': this.dataForm.profile,
              'nickname': this.dataForm.nickname,
              'status': this.dataForm.status,
              'roleIdList': this.dataForm.roleIdList
            })
          }).then((response) => {
            if (response && response.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  if (this.dataForm.id === this.$store.state.user.userId) {
                    this.$router.go(0)
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
    },
    // 上传之前
    beforeUploadHandle (file) {
      if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
        this.$message.error('暂时只支持jpg、png、gif格式的图片！')
        return false
      }
    },
    // 上传成功
    successHandle (response) {
      if (response && response.code === 200) {
        this.dataForm.profile = response.data.url
        this.file = [response.data]
        this.$message.success('上传成功！')
      }
    },
    // 移除上传文件
    handleRemove (file, fileList) {
      this.file = []
      this.dataForm.profile = ''
    }
  }
}
</script>
