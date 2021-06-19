<template>
  <div>
    <el-form :inline="true" :model="dataForm" @submit.native.prevent>
      <el-form-item label="文章标题">
        <el-input placeholder="文章标题" v-model="dataForm.title" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button v-if="isAuth('article:list')" @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('article:delete')" type="danger" :disabled="dataListSelections.length <= 0" @click="deleteHandle()">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
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
            <el-form-item label="封面：">
              <div v-if="scope.row.cover !== null && scope.row.cover !== ''">
                <el-popover placement="top-start" title="" trigger="hover">
                  <img :src="scope.row.cover" alt="" style="width: 300px;height: 250px">
                  <img slot="reference" :src="scope.row.cover" style="width: 120px;height: 100px">
                </el-popover>
                <span>（<a>{{ scope.row.cover }}</a>）</span>
              </div>
              <div v-else>
                <span>暂无封面</span>
              </div>
            </el-form-item>
            <el-form-item label="文章标题：">
              <span>{{ scope.row.title }}</span>
            </el-form-item>
            <el-form-item label="文章简介：">
              <p style="display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 3;overflow: hidden">{{ scope.row.description }}</p>
            </el-form-item>
            <el-form-item label="作者：">
              <span>{{ scope.row.author }}</span>
            </el-form-item>
            <el-form-item label="分类：">
              <span>{{ scope.row.categoryListStr }}</span>
            </el-form-item>
            <el-form-item label="标签：">
              <el-row>
                <el-button style="margin-top: 8px" v-for="tag in scope.row.tagList" :key="tag.id" size="mini">{{tag.name}}</el-button>
              </el-row>
            </el-form-item>
            <el-form-item label="阅读量：">
              <span>{{ scope.row.readNum }}</span>
            </el-form-item>
            <el-form-item label="点赞量：">
              <span>{{ scope.row.likeNum }}</span>
            </el-form-item>
            <el-form-item v-if="isAuth('article:update') && (scope.row.createrId === userId || scope.row.open)" label="发布：">
              <el-tooltip class="item" effect="dark" content="点击发布" v-if="!scope.row.publish" placement="top">
                <el-button type="info" size="mini" @click="updatePublish(scope.row.id, true)">未发布</el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="点击下架" v-if="scope.row.publish" placement="top">
                <el-button type="success" size="mini" @click="updatePublish(scope.row.id, false)" v-if="scope.row.publish === true">已发布</el-button>
              </el-tooltip>
            </el-form-item>
            <el-form-item v-else label="发布：">
              <span v-if="!scope.row.publish">未发布</span>
              <span v-else>已发布</span>
            </el-form-item>
            <el-form-item v-if="isAuth('article:update') && (scope.row.createrId === userId || scope.row.open)" label="公开：">
              <el-tooltip class="item" effect="dark" content="点击公开" v-if="!scope.row.open" placement="top">
                <el-button type="info" size="mini" @click="updateOpen(scope.row.id, true)">未公开</el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="点击隐藏" v-if="scope.row.open" placement="top">
                <el-button type="success" size="mini" @click="updateOpen(scope.row.id, false)" v-if="scope.row.open === true">已公开</el-button>
              </el-tooltip>
            </el-form-item>
            <el-form-item v-else label="公开：">
              <span v-if="!scope.row.open">未公开</span>
              <span v-else>已公开</span>
            </el-form-item>
            <el-form-item v-if="isAuth('article:update') && (scope.row.createrId === userId || scope.row.open)" label="推荐：">
              <el-switch
                v-model="scope.row.recommend"
                active-color="#13ce66"
                @change="updateRecommend(scope.row.id,scope.row.recommend)">
              </el-switch>
            </el-form-item>
            <el-form-item v-else label="推荐：">
              <span v-if="!scope.row.recommend">未推荐</span>
              <span v-else>已推荐</span>
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
              <el-button type="text" size="small" @click="toView(scope.row.id)">查看</el-button>
              <el-button v-if="isAuth('article:update') && (scope.row.createrId === userId || scope.row.open)" type="text" size="small" @click="updateHandle(scope.row.id, scope.row.open)">修改</el-button>
              <el-button v-if="isAuth('article:delete') && (scope.row.createrId === userId || scope.row.open)" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        fixed="left"
        type="selection"
        header-align="center"
        align="center"
        width="50px">
      </el-table-column>
      <el-table-column
        prop="id"
        fixed="left"
        header-align="center"
        align="center"
        width="70px"
        label="id">
      </el-table-column>
      <el-table-column
        prop="cover"
        header-align="center"
        align="center"
        label="封面"
        width="150px">
        <template slot-scope="scope" >
          <div v-if="scope.row.cover !== null && scope.row.cover !== ''">
            <el-popover placement="top-start" title="" trigger="hover">
              <img :src="scope.row.cover" alt="" style="width: 300px;height: 250px">
              <img slot="reference" :src="scope.row.cover" style="width: 120px;height: 100px">
            </el-popover>
          </div>
          <div v-else>
            <span>暂无封面</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="title"
        header-align="center"
        align="center"
        label="文章标题"
        :show-overflow-tooltip="true"
        width="250px">
      </el-table-column>
      <el-table-column
        prop="description"
        header-align="center"
        align="center"
        label="文章简介"
        :show-overflow-tooltip="true"
        width="250px">
      </el-table-column>
      <el-table-column
        prop="author"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="作者">
      </el-table-column>
      <el-table-column
        prop="categoryListStr"
        header-align="center"
        align="center"
        :show-overflow-tooltip="true"
        label="分类"
        width="200px">
      </el-table-column>
      <el-table-column
        prop="tagList"
        header-align="center"
        align="center"
        label="标签"
        width="300px">
        <template slot-scope="scope">
          <el-row>
            <el-button style="margin-top: 8px" v-for="tag in scope.row.tagList" :key="tag.id" size="mini">{{tag.name}}</el-button>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column
        prop="readNum"
        header-align="center"
        align="center"
        width="100px"
        label="阅读量">
      </el-table-column>
      <el-table-column
        prop="likeNum"
        header-align="center"
        align="center"
        width="100px"
        label="点赞量">
      </el-table-column>
      <el-table-column
        prop="publish"
        header-align="center"
        align="center"
        width="100px"
        label="发布">
        <template slot-scope="scope">
          <div v-if="isAuth('article:update') && (scope.row.createrId === userId || scope.row.open)">
            <el-tooltip class="item" effect="dark" content="点击发布" v-if="!scope.row.publish" placement="top">
              <el-button type="info" size="mini" @click="updatePublish(scope.row.id, true)">未发布</el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="点击下架" v-if="scope.row.publish" placement="top">
              <el-button type="success" size="mini" @click="updatePublish(scope.row.id, false)" v-if="scope.row.publish === true">已发布</el-button>
            </el-tooltip>
          </div>
          <div v-else>
            <span v-if="!scope.row.publish">未发布</span>
            <span v-else>已发布</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="open"
        header-align="center"
        align="center"
        width="100px"
        label="公开">
        <template slot-scope="scope">
          <div v-if="isAuth('article:update') && (scope.row.createrId === userId || scope.row.open)">
            <el-tooltip class="item" effect="dark" content="点击公开" v-if="!scope.row.open" placement="top">
              <el-button type="info" size="mini" @click="updateOpen(scope.row.id, true)">未公开</el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="点击隐藏" v-if="scope.row.open" placement="top">
              <el-button type="success" size="mini" @click="updateOpen(scope.row.id, false)" v-if="scope.row.open === true">已公开</el-button>
            </el-tooltip>
          </div>
          <div v-else>
            <span v-if="!scope.row.open">未公开</span>
            <span v-else>已公开</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="recommend"
        header-align="center"
        align="center"
        min-width="100px"
        label="推荐">
        <template slot-scope="scope">
          <div v-if="isAuth('article:update') && (scope.row.createrId === userId || scope.row.open)">
            <el-switch
              v-model="scope.row.recommend"
              active-color="#13ce66"
              @change="updateRecommend(scope.row.id,scope.row.recommend)">
            </el-switch>
          </div>
          <div v-else>
            <span v-if="!scope.row.recommend">未推荐</span>
            <span v-else>已推荐</span>
          </div>
        </template>
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
        min-width="200px"
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="toView(scope.row.id)">查看</el-button>
          <el-button v-if="isAuth('article:update') && (scope.row.createrId === userId || scope.row.open)" type="text" size="small" @click="updateHandle(scope.row.id, scope.row.open)">修改</el-button>
          <el-button v-if="isAuth('article:delete') && (scope.row.createrId === userId || scope.row.open)" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
        </template>
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
import middle from '../../../utils/middle.js'

export default {
  data () {
    return {
      dataForm: {
        title: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 20,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      userId: this.$store.state.user.userId
    }
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
    var that = this
    middle.$on('refreshArticleDataList', function () {
      that.getDataList()
    })
  },
  computed: {
    mainTabs: {
      get () { return this.$store.state.common.mainTabs },
      set (val) { this.$store.commit('common/updateMainTabs', val) }
    }
  },
  methods: {
    toView (id) {
      window.open('https://jinhx.cc/article/' + id, '_blank')
    },
    // tabs, 是否存在该标签已经打开
    existTabHandle (tabName) {
      return this.mainTabs.filter(item => item.name === tabName).length >= 1
    },
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
        url: this.$http.adornUrl('/manage/article/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'title': this.dataForm.title
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
    //  修改
    updateHandle (id) {
      if (this.existTabHandle('article-article-update')) {
        this.$confirm(`已经存在文章修改页面，继续修改当前文章，将直接保存旧页面的文章内容!`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$router.replace({name: 'article-article-update', params: { id: id }})
        }).catch(() => {})
      } else {
        this.$router.replace({name: 'article-article-update', params: { id: id }})
      }
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
          url: this.$http.adornUrl('/manage/article/delete'),
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
    // 更新文章推荐状态
    updateRecommend (id, value) {
      let data = {
        id: id,
        recommend: value
      }
      this.updateStatus(data)
    },
    // 更新文章置顶状态
    updateTop (id, value) {
      let data = {
        id: id,
        top: value
      }
      this.updateStatus(data)
    },
    // 更新文章发布状态
    updatePublish (id, value) {
      let data = {
        id: id,
        publish: value
      }
      this.updateStatus(data)
    },
    // 更新文章公开状态
    updateOpen (id, value) {
      let data = {
        id: id,
        open: value
      }
      this.updateStatus(data)
    },
    // 更新文章
    updateStatus (data) {
      this.$http({
        url: this.$http.adornUrl(`/manage/article/update/status`),
        method: 'put',
        data: this.$http.adornData(data)
      }).then((response) => {
        if (response && response.code === 200) {
          this.$message.success('更新成功')
          this.getDataList()
        } else {
          this.$message.error(response.msg)
        }
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
