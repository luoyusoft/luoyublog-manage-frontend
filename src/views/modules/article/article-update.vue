  <template>
  <div>
    <el-form :model="article" label-width="80px" :rules="rules" ref="articleForm">
      <el-form-item label="文章标题">
        <el-col :span="18">
          <el-input placeholder="文章标题" v-model="article.title"  clearable></el-input>
        </el-col>
      </el-form-item>
      <el-row>
        <el-col :span="9">
          <el-form-item label="文章分类">
            <el-cascader
              clearable
              change-on-select
              placeholder="请选择文章分类"
              :options="categoryOptions"
              v-model="categoryOptionsSelect"
              :props="categoryListTreeProps">
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="文章标签">
            <el-select
              v-model="tagListSelect"
              multiple
              allow-create
              filterable
              default-first-option
              placeholder="请选择文章标签" @change="filterTagList">
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
      <el-form-item label="作者">
        <el-row>
          <el-col :span="6">
            <el-input placeholder="作者" v-model="article.author" clearable></el-input>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="是否推荐">
        <el-radio-group v-model="article.recommend">
          <el-radio :label="true" >是</el-radio>
          <el-radio :label="false" >否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="展示类型">
        <el-radio-group v-model="article.coverType">
          <el-radio v-for="type in coverTypeList" :key="type.parKey" :label="type.parKey" >{{type.parValue}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上传封面">
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
      <el-form-item label="描述">
        <el-col :span="12">
          <el-input type="textarea" v-model="article.description" placeholder="描述" clearable></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="内容">
        <mavon-editor style="z-index:500" ref=md v-model="article.content" @imgAdd="imgAdd" @change="mavonChangeHandle"></mavon-editor>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveArticle(false)">保存</el-button>
        <el-button>重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import MavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import { treeDataTranslate } from '@/utils'
import marked from 'marked'

export default {
  components: {
    'mavon-editor': MavonEditor.mavonEditor
  },
  data () {
    return {
      article: {
        recommend: false,
        tagList: [],
        module: 0,
        content: '',
        coverType: 2 // 默认无图片
      },
      coverTypeList: this.getSysParamArr('ARTICLE_COVER_TYPE'),
      url: '',
      file: [],
      rules: {
        title: {required: true, message: '请输入文章标题', trigger: 'change'},
        author: {required: true, message: '请输入作者', trigger: 'change'},
        content: {required: true, message: '请输入内容', trigger: 'change'}
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
      // 自动保存
      articleTimer: 0,
      articleStartWatch: false,
      articleWatchTime: 5 * 60 * 1000
    }
  },
  activated () {
    // 已经打开过标签，第二次进来不会有id，除非重新打开新的文章
    this.init(this.$route.params.id)
  },
  beforeDestroy () {
    if (this.articleStartWatch) {
      // 清除
      clearInterval(this.articleTimer)
    }
  },
  methods: {
    // 自动保存
    watchSave () {
      this.saveArticle(true)
    },
    init (id) {
      // 获取文章分类
      this.$http({
        url: this.$http.adornUrl('/manage/operation/category/list'),
        method: 'get',
        params: this.$http.adornParams({
          module: 0,
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
          params: this.$http.adornParams({module: 0})
        }).then((response) => {
          if (response && response.code === 200) {
            this.tagList = response.data
          }
        })
      }).then(() => {
        if (id) {
          // 除了第一次进来，后面进来，有id的话，并且跟原本的不一样的话，直接先保存旧的
          if (this.article.id !== id) {
            if (this.article.id) {
              this.saveArticle(true)
            }
            this.$http({
              url: this.$http.adornUrl('/manage/article/info/' + id),
              method: 'get',
              params: this.$http.adornParams()
            }).then((response) => {
              if (response && response.code === 200) {
                this.article = response.data
                this.file = [{url: response.data.cover}]
                // 转换tagList
                this.tagListSelect = this.article.tagList.map(tag => {
                  return tag.id
                })
                // 转换categoryId
                this.categoryOptionsSelect = this.article.categoryId.split(',').map((data) => { return +data })
                // 开启定时保存
                if (!this.articleStartWatch) {
                  // 创建监听器
                  this.$watch('article', (newVal, oldVal) => {
                    // console.log('2-' + JSON.stringify(newVal) + '，3-' + JSON.stringify(oldVal) + '，4-' + JSON.stringify(this.article))
                    // 先清除旧的监听器
                    clearInterval(this.articleTimer)
                    // 每10分钟自动保存
                    this.articleTimer = setInterval(this.watchSave, this.articleWatchTime)
                  }, {deep: true})
                  this.articleStartWatch = true
                }
              }
            })
          }
        }
      }).then(() => {
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
            tagList.push({id: tag.id, name: tag.name, module: 0})
          }
        }
        if (isInput) {
          tagList.push({name: value, module: 0})
        }
      })
      this.article.tagList = tagList
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
        this.article.cover = response.data.url
        this.file = [response.data]
        this.$message.success('上传成功！')
      }
    },
    // 移除上传文件
    handleRemove (file, fileList) {
      this.file = []
      this.article.cover = ''
    },
    // 保存文章
    saveArticle (isWatch) {
      this.$refs['articleForm'].validate((valid) => {
        if (valid) {
          // 转化categoryId
          this.article.categoryId = this.categoryOptionsSelect.join(',')
          this.$http({
            url: this.$http.adornUrl(`/manage/article/${!this.article.id ? 'save' : 'update'}`),
            method: !this.article.id ? 'post' : 'put',
            data: this.$http.adornData(this.article)
          }).then((response) => {
            if (response && response.code === 200) {
              this.$message.success('保存文章成功')
              if (this.articleStartWatch) {
                // 清除
                clearInterval(this.articleTimer)
              }
              if (!isWatch) {
                // 关闭当前标签
                this.$emit('closeCurrentTabs')
                // 跳转到list
                this.$router.push('/article-article')
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
    // 文章内容图片上传
    imgAdd (pos, $file) {
      // 第一步.将图片上传到服务器.
      let formData = new FormData()
      formData.append('file', $file)
      this.$http({
        url: this.url,
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then((response) => {
        this.$refs.md.$img2Url(pos, response.data.url)
      })
    },
    mavonChangeHandle (context, render) {
      this.article.contentFormat = marked(context, {breaks: true})
    }
  }
}
</script>
