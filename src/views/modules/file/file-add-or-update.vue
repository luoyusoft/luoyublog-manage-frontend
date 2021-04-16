  <template>
  <div>
    <el-form label-width="100px">
      <el-form-item label="上传小文件">
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
            <div class="el-upload__tip" slot="tip">暂时只支持jpg、png、gif格式的文件！</div>
          </el-upload>
        </el-col>
      </el-form-item>
      <el-form-item label="上传大文件">
        <el-col :span="24">
          <div class="mater-upload-container">
            <uploader-container
              ref="upload"
              :before-upload="beforeUpload"
              :accept="accepts"
              :module="1"
              :upload-arguments="uploadArgumentsObj"
              :limit="limit"
              :on-exceed="fileLimitFn"
              :chunk-size="chunkSize"
              @successUpload="successUpload">
              <div slot="tip" class="upload-tip">
                <i class="el-icon-info"></i>:
                暂时只支持：{{ acceptDesc[uploadType] }}格式的文件！
              </div>
            </uploader-container>
          </div>
        </el-col>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import 'mavon-editor/dist/css/index.css'
import { quillEditor } from 'vue-quill-editor'
import UploaderContainer from '@/views/uploader-container'

export default {
  data () {
    return {
      url: this.$http.adornUrl(`/manage/file/minio/upload?token=${this.$cookie.get('token')}&module=3`),
      file: [],
      accepts: 'image/png',
      acceptsObj: {
        all: [
          'video/mp4',
          'image/png',
          'image/gif',
          'image/jpeg',
          'image/jpg',
          'image/bmp',
          '.',
          'audio/mp3',
          'audio/mpeg',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          '.ppt',
          '.pptx',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        video: ['video/mp4'],
        image: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'image/jpg',
          'image/bmp',
          '.'
        ], // 火狐的accept只支持【.png,.jpg】这种形式，为了兼容，使用 .
        audio: ['audio/mp3', 'audio/mpeg'],
        ppt: [
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          '.ppt',
          '.pptx'
        ],
        excel: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
      },
      acceptDesc: {
        all: 'mp4,png,gif,jpeg,jpg,bmp,mp3,ppt,xls,xlsx',
        video: 'mp4',
        image: 'png,gif,jpeg,jpg,bmp',
        audio: 'mp3',
        ppt: 'ppt',
        excel: 'xls,xlsx'
      },
      // 临时自测使用
      uploadArguments: {
        type: 'all'
      },
      limit: 20,
      // chunkSize: 50 * 1024 * 1024,
      chunkSize: 200 * 1024 * 1024,
      // 是否共享 0私有  1共享
      share: 1
    }
  },
  components: {
    quillEditor,
    UploaderContainer
  },
  computed: {
    uploadType () {
      return this.uploadArguments.type
    },
    uploadArgumentsObj () {
      return { ...this.uploadArguments, share: this.share }
    }
  },
  created () {
    if (this.uploadType) {
      this.accepts = this.acceptsObj[this.uploadType].join(',') // 设置文件类型
    } else {
      this.$message('存在类型不正确的文件')
    }
  },
  methods: {
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
        this.$message.success('上传成功！')
      }
    },
    // 移除上传文件
    handleRemove (file, fileList) {
      this.file = []
    },
    beforeUpload (file) {
      console.log('上传文件之前校验：', file)
      if (this.acceptsObj[this.uploadType].indexOf(file.type) === -1) {
        this.$message.warning('只能上传：' + this.acceptDesc[this.uploadType])
        return false
      }
      if (!file.size) {
        setTimeout(() => {
          this.$message.warning('不能上传大小为0的文件')
        }, 500)
        return false
      }
      return this.propertyRestrictions(file)
    },
    // 文件个数限制钩子
    fileLimitFn (files) {
      this.$message.warning(`最多支持选择${this.limit}个文件`)
    },
    // 清空文件，暂未使用
    clearFiles () {
      this.$refs.upload.clearFiles()
    },
    successUpload (url) {
      console.log('上传成功，地址：' + url)
      this.$message.success('上传成功！')
    },
    // 属性限制
    async propertyRestrictions (file) {
      return new Promise(async (resolve, reject) => {
        if (this.uploadType === 'image') {
          const isVerifyResolution = await this.verifyResolution(file)
          console.log('属性限制：', isVerifyResolution)
          if (!isVerifyResolution) {
            this.$message.warning('messageTips.notAbove4k')
            reject(new Error())
          }
        }
        resolve(true)
      })
    },
    // 分辨率校验
    verifyResolution (file, maxWidth = 3840, maxHeight = 2160) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function () {
          if (reader.readyState === 2) {
            const img = new Image()
            img.src = reader.result
            img.onload = function () {
              const width = this.width
              const height = this.height
              const bool = width > maxWidth || height > maxHeight
              if (bool) {
                resolve(false)
              }
              resolve(true)
            }
          }
        }
      })
    }
  }
}
</script>
