  <template>
  <div>
    <el-form :model="video" label-width="80px" :rules="rules" ref="videoForm">
      <el-form-item label="视频标题">
        <el-col :span="18">
          <el-input placeholder="视频标题" v-model="video.title"  clearable></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="视频又名">
        <el-col :span="18">
          <el-input placeholder="视频又名" v-model="video.alternateName"  clearable></el-input>
        </el-col>
      </el-form-item>
      <el-row>
        <el-col :span="9">
          <el-form-item label="视频分类">
            <el-cascader
              clearable
              change-on-select
              :options="categoryOptions"
              v-model="categoryOptionsSelect"
              :props="categoryListTreeProps">
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="视频标签">
            <el-select
              v-model="tagListSelect"
              multiple
              allow-create
              filterable
              default-first-option
              placeholder="请选择视频标签" @change="filterTagList">
              <el-option
                v-for="item in tagList"
                  :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="9">
          <el-form-item label="上映日期">
            <el-date-picker value-format="yyyy-MM-dd" type="date" placeholder="上映日期" v-model="video.releaseTime"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="制片国家/地区" label-width="120px">
            <el-input placeholder="制片国家/地区" v-model="video.productionRegion" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="上传者">
            <el-input placeholder="上传者" v-model="video.author" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="导演">
            <el-input placeholder="导演" v-model="video.director" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="编剧">
            <el-input placeholder="编剧" v-model="video.screenwriter" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="语言">
            <el-input placeholder="语言" v-model="video.language" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="主演">
            <el-input placeholder="主演" v-model="video.toStar" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="评分">
            <el-rate v-model="video.score" allow-half style="line-height: 2" show-score text-color="#ff9900"></el-rate>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="片长（格式：HH:mm:ss）" label-width="200px">
            <el-input placeholder="片长（格式：HH:mm:ss）" v-model="video.duration" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="是否推荐">
        <el-radio-group v-model="video.recommend">
          <el-radio :label="true" >是</el-radio>
          <el-radio :label="false" >否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上传封面">
        <el-col :span="12">
          <el-upload
            drag
            :action="url"
            list-type="picture"
            :multiple="false"
            :before-upload="beforeUploadHandleImg"
            :file-list="file"
            :on-remove="handleRemoveImg"
            :on-success="successHandleImg">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
              <i class="el-icon-info"></i>:
              暂时只支持：jpg,png,gif格式的图片！
            </div>
          </el-upload>
        </el-col>
      </el-form-item>
<!--      <el-form-item label="上传视频">-->
<!--        <el-col :span="12">-->
<!--          <el-upload-->
<!--            drag-->
<!--            :action="url"-->
<!--            list-type="text"-->
<!--            :multiple="false"-->
<!--            :before-upload="beforeUploadHandleVideo"-->
<!--            :file-list="videoFile"-->
<!--            :on-remove="handleRemoveVideo"-->
<!--            :on-success="successHandleVideo">-->
<!--            <i class="el-icon-upload"></i>-->
<!--            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>-->
<!--            <div class="el-upload__tip" slot="tip">暂时只支持mp4格式的图片！</div>-->
<!--          </el-upload>-->
<!--        </el-col>-->
<!--      </el-form-item>-->
      <el-form-item label="上传视频">
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
                暂时只支持：{{ acceptDesc[uploadType] }}格式的视频！
              </div>
            </uploader-container>
          </div>
        </el-col>
      </el-form-item>
      <el-form-item label="剧情简介">
        <quill-editor v-model="video.synopsis"></quill-editor>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveVideo(false)">保存</el-button>
        <el-button>重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// require styles 引入样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
import { treeDataTranslate } from '@/utils'
import UploaderContainer from '@/views/uploader-container'

export default {
  data () {
    return {
      video: {
        recommend: false,
        tagList: [],
        releaseTime: ''
      },
      url: '',
      file: [],
      videoFile: [],
      rules: {
        title: {required: true, message: '请输入视频标题', trigger: 'change'},
        releaseTime: {required: true, message: '请输入上映日期', trigger: 'change'},
        productionRegion: {required: true, message: '请输入制片国家/地区', trigger: 'change'},
        author: {required: true, message: '请输入上传者', trigger: 'change'},
        director: {required: true, message: '请输入导演', trigger: 'change'},
        screenwriter: {required: true, message: '请输入编剧', trigger: 'change'},
        duration: {required: true, message: '请输入片长', trigger: 'change'},
        language: {required: true, message: '请输入语言', trigger: 'change'},
        toStar: {required: true, message: '请输入主演', trigger: 'change'}
      },
      tagList: [],
      tagListSelect: [],
      tagListNew: [],
      categoryOptions: [],
      categoryOptionsSelect: [],
      categoryListTreeProps: {
        label: 'name',
        children: 'children',
        value: 'id'
      },
      accepts: 'video/mp4',
      acceptsObj: {
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
        video: 'mp4',
        image: 'png,gif,jpeg,jpg,bmp',
        audio: 'mp3',
        ppt: 'ppt',
        excel: 'xls,xlsx'
      },
      // 临时自测使用
      uploadArguments: {
        type: 'video'
      },
      limit: 20,
      // chunkSize: 50 * 1024 * 1024,
      chunkSize: 200 * 1024 * 1024,
      // 是否共享 0私有  1共享
      share: 1,
      // 自动保存
      videoTimer: 0,
      videoStartWatch: false,
      videoWatchTime: 5 * 60 * 1000
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
      // 设置文件类型
      this.accepts = this.acceptsObj[this.uploadType].join(',')
    } else {
      this.$message('存在类型不正确的文件')
    }
  },
  activated () {
    // 已经打开过标签，第二次进来不会有id，除非重新打开新的文章
    this.init(this.$route.params.id)
  },
  beforeDestroy () {
    if (this.videoStartWatch) {
      // 清除
      clearInterval(this.videoTimer)
    }
  },
  methods: {
    // 自动保存
    watchSave () {
      this.saveVideo(true)
    },
    init (id) {
      // 获取视频分类
      this.$http({
        url: this.$http.adornUrl('/manage/operation/category/list'),
        method: 'get',
        params: this.$http.adornParams({
          module: 1,
          name: ''
        })
      }).then((response) => {
        if (response && response.code === 200) {
          this.categoryOptions = treeDataTranslate(response.data)
        }
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/manage/operation/tag/select'),
          method: 'get',
          params: this.$http.adornParams({module: 1})
        }).then((response) => {
          if (response && response.code === 200) {
            this.tagList = response.data
          }
        })
      }).then(() => {
        if (id) {
          // 除了第一次进来，后面进来，有id的话，并且跟原本的不一样的话，直接先保存旧的
          if (this.video.id !== id) {
            if (this.video.id) {
              this.saveVideo(true)
            }
            this.$http({
              url: this.$http.adornUrl('/manage/video/info/' + id),
              method: 'get',
              params: this.$http.adornParams()
            }).then((response) => {
              if (response && response.code === 200) {
                this.video = response.data
                this.video.publishDate = new Date(response.data.publishDate)
                this.file = [{url: response.data.cover}]
                this.videoFile = [{url: response.data.videoUrl}]
                this.video.score = parseFloat(response.data.score)
                // 转换tagList
                this.tagListSelect = this.video.tagList.map(tag => {
                  return tag.id
                })
                // 转换categoryId
                this.categoryOptionsSelect = this.video.categoryId.split(',').map((data) => { return +data })
                // 开启定时保存
                if (!this.videoStartWatch) {
                  // 创建监听器
                  this.$watch('video', (newVal, oldVal) => {
                    // console.log('2-' + JSON.stringify(newVal) + '，3-' + JSON.stringify(oldVal) + '，4-' + JSON.stringify(this.video))
                    // 先清除旧的监听器
                    clearInterval(this.videoTimer)
                    // 每10分钟自动保存
                    this.videoTimer = setInterval(this.watchSave, this.videoWatchTime)
                  }, {deep: true})
                  this.videoStartWatch = true
                }
              }
            })
          }
        }
      })
    },
    // 过滤标签
    filterTagList (selectValueList) {
      let tagList = []
      selectValueList.forEach(value => {
        let isInput = true
        for (let i = 0; i < this.tagList.length; i++) {
          let tag = this.tagList[i]
          if (tag.id === value || value.id) {
            isInput = false
            tagList.push({id: tag.id, name: tag.name, module: 1})
          }
        }
        if (isInput) {
          tagList.push({name: value, module: 1})
        }
      })
      this.video.tagList = tagList
    },
    // 上传图片之前
    beforeUploadHandleImg (file) {
      if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
        this.$message.error('暂时只支持jpg、png、gif格式的图片！')
        return false
      }
    },
    // 上传图片成功
    successHandleImg (response) {
      if (response && response.code === 200) {
        this.video.cover = response.data.url
        this.file = [response.data]
        this.$message.success('上传成功！')
      }
    },
    // 移除上传图片
    handleRemoveImg (file, fileList) {
      this.file = []
      this.video.cover = ''
    },
    // 保存视频
    saveVideo (isWatch) {
      this.$refs['videoForm'].validate((valid) => {
        if (valid) {
          // 转化categoryId
          this.video.categoryId = this.categoryOptionsSelect.join(',')
          this.$http({
            url: this.$http.adornUrl(`/manage/video/${!this.video.id ? 'save' : 'update'}`),
            method: !this.video.id ? 'post' : 'put',
            data: this.$http.adornData(this.video)
          }).then((response) => {
            if (response && response.code === 200) {
              this.$message.success('保存视频成功')
              if (this.videoStartWatch) {
                // 清除
                clearInterval(this.videoTimer)
              }
              if (!isWatch) {
                // 关闭当前标签
                this.$emit('closeCurrentTabs')
                // 跳转到list
                this.$router.push('/video-video')
              }
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          return false
        }
      })
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
      this.video.videoUrl = url
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
