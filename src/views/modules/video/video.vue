<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @submit.native.prevent>
      <el-form-item>
        <el-input v-model="dataForm.title" placeholder="视频标题" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button v-if="isAuth('video:list')" @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('video:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
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
                  <img :src="scope.row.cover" alt="" style="width: 250px;height: 300px">
                  <img slot="reference" :src="scope.row.cover" style="width: 100px;height: 120px">
                </el-popover>
                <span>（<a>{{ scope.row.cover }}</a>）</span>
              </div>
              <div v-else>
                <span>暂无封面</span>
              </div>
            </el-form-item>
            <el-form-item label="视频地址：">
              <a>{{ scope.row.videoUrl }}</a>
            </el-form-item>
            <el-form-item label="标题：">
              <span>{{ scope.row.title }}</span>
            </el-form-item>
            <el-form-item label="剧情简介：">
              <p style="display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 3;overflow: hidden">{{ scope.row.synopsis }}</p>
            </el-form-item>
            <el-form-item label="又名：">
              <span>{{ scope.row.alternateName }}</span>
            </el-form-item>
            <el-form-item label="上传者：">
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
            <el-form-item label="制片国家/地区：">
              <span>{{ scope.row.productionRegion }}</span>
            </el-form-item>
            <el-form-item label="导演：">
              <span>{{ scope.row.director }}</span>
            </el-form-item>
            <el-form-item label="上映日期：">
              <span>{{ scope.row.releaseTime }}</span>
            </el-form-item>
            <el-form-item label="片长：">
              <span>{{ scope.row.duration }}</span>
            </el-form-item>
            <el-form-item label="语言：">
              <span>{{ scope.row.language }}</span>
            </el-form-item>
            <el-form-item label="主演：">
              <span>{{ scope.row.toStar }}</span>
            </el-form-item>
            <el-form-item label="编剧：">
              <span>{{ scope.row.screenwriter }}</span>
            </el-form-item>
            <el-form-item label="评分：">
              <el-rate
                v-model="scope.row.score"
                disabled
                show-score
                allow-half
                text-color="#ff9900">
              </el-rate>
            </el-form-item>
            <el-form-item label="观看量：">
              <span>{{ scope.row.watchNum }}</span>
            </el-form-item>
            <el-form-item label="点赞量：">
              <span>{{ scope.row.likeNum }}</span>
            </el-form-item>
            <el-form-item label="状态：">
              <el-tooltip class="item" effect="dark" content="点击发布" v-if="!scope.row.publish" placement="top">
                <el-button type="info" size="mini" @click="updatePublish(scope.row.id, true)">未发布</el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="点击下架" v-if="scope.row.publish" placement="top">
                <el-button type="success" size="mini" @click="updatePublish(scope.row.id, false)" v-if="scope.row.publish === true">已发布</el-button>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="推荐：">
              <el-switch
                v-model="scope.row.recommend"
                active-color="#13ce66"
                @change="updateRecommend(scope.row.id,scope.row.recommend)">
              </el-switch>
            </el-form-item>
            <el-form-item label="创建时间：">
              <span>{{ scope.row.createTime }}</span>
            </el-form-item>
            <el-form-item label="更新时间：">
              <span>{{ scope.row.updateTime }}</span>
            </el-form-item>
            <el-form-item label="操作：">
              <el-button v-if="isAuth('video:update')" type="text" size="small" @click="updateHandle(scope.row.id)">修改</el-button>
              <el-button v-if="isAuth('video:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
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
        fixed="left"
        prop="id"
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
              <img :src="scope.row.cover" alt="" style="width: 250px;height: 300px">
              <img slot="reference" :src="scope.row.cover" style="width: 100px;height: 120px">
            </el-popover>
          </div>
          <div v-else>
            <span>暂无封面</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="videoUrl"
        header-align="center"
        align="center"
        width="250px"
        :show-overflow-tooltip="true"
        label="视频地址">
      </el-table-column>
      <el-table-column
          prop="title"
          header-align="center"
          align="center"
          width="250px"
          :show-overflow-tooltip="true"
          label="标题">
      </el-table-column>
      <el-table-column
        prop="synopsis"
        header-align="center"
        align="center"
        width="250px"
        :show-overflow-tooltip="true"
        label="剧情简介">
      </el-table-column>
      <el-table-column
        prop="alternateName"
        header-align="center"
        align="center"
        width="250px"
        :show-overflow-tooltip="true"
        label="又名">
      </el-table-column>
      <el-table-column
        prop="author"
        header-align="center"
        align="center"
        width="100px"
        :show-overflow-tooltip="true"
        label="上传者">
      </el-table-column>
      <el-table-column
        prop="categoryListStr"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="分类">
      </el-table-column>
      <el-table-column
        prop="tagList"
        header-align="center"
        align="center"
        label="标签"
        width="300px">
        <template slot-scope="scope">
          <el-row>
            <el-button v-for="tag in scope.row.tagList" :key="tag.id" size="mini">{{tag.name}}</el-button>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column
        prop="productionRegion"
        header-align="center"
        align="center"
        width="150px"
        :show-overflow-tooltip="true"
        label="制片国家/地区">
      </el-table-column>
      <el-table-column
        prop="director"
        header-align="center"
        align="center"
        width="100px"
        :show-overflow-tooltip="true"
        label="导演">
      </el-table-column>
      <el-table-column
        prop="releaseTime"
        header-align="center"
        align="center"
        width="100px"
        label="上映日期">
      </el-table-column>
      <el-table-column
        prop="duration"
        header-align="center"
        align="center"
        width="100px"
        label="片长">
      </el-table-column>
      <el-table-column
        prop="language"
        header-align="center"
        align="center"
        width="100px"
        :show-overflow-tooltip="true"
        label="语言">
      </el-table-column>
      <el-table-column
        prop="toStar"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="主演">
      </el-table-column>
      <el-table-column
        prop="screenwriter"
        header-align="center"
        align="center"
        width="200px"
        :show-overflow-tooltip="true"
        label="编剧">
      </el-table-column>
      <el-table-column
        prop="score"
        header-align="center"
        align="center"
        width="200px"
        label="评分">
        <template slot-scope="scope">
          <el-rate
            v-model="scope.row.score"
            disabled
            show-score
            allow-half
            text-color="#ff9900">
          </el-rate>
        </template>
      </el-table-column>
      <el-table-column
        prop="watchNum"
        header-align="center"
        align="center"
        width="100px"
        label="观看量">
      </el-table-column>
      <el-table-column
        prop="likeNum"
        header-align="center"
        align="center"
        width="100px"
        label="点赞量">
      </el-table-column>
      <el-table-column
        prop="recommend"
        header-align="center"
        align="center"
        label="状态"
        width="100px">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="点击发布" v-if="!scope.row.publish" placement="top">
            <el-button type="info" size="mini" @click="updatePublish(scope.row.id, true)">未发布</el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="点击下架" v-if="scope.row.publish" placement="top">
            <el-button type="success" size="mini" @click="updatePublish(scope.row.id, false)" v-if="scope.row.publish === true">已发布</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="recommend"
        header-align="center"
        align="center"
        label="推荐"
        width="100px">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.recommend"
            active-color="#13ce66"
            @change="updateRecommend(scope.row.id,scope.row.recommend)">
          </el-switch>
        </template>
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
        min-width="100px"
        label="操作">
        <template slot-scope="scope">
          <el-button v-if="isAuth('video:update')" type="text" size="small" @click="updateHandle(scope.row.id)">修改</el-button>
          <el-button v-if="isAuth('video:delete')" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
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
    <!-- 弹窗, 读后感 -->
<!--    <el-dialog title="读后感" :visible.sync="bookSenseVisible">-->
<!--      <el-form>-->
<!--        <el-form-item label="作者">-->
<!--          <el-input v-model="bookSense.author"/>-->
<!--        </el-form-item>-->
<!--        <el-form-item>-->
<!--          <quill-editor v-model="bookSense.content"></quill-editor>-->
<!--        </el-form-item>-->
<!--        <el-form-item>-->
<!--          <el-button type="primary" @click="updateReadSense()">保存</el-button>-->
<!--          <el-button @click="bookSenseVisible = false" >取消</el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </el-dialog>-->
  </div>
</template>

<script>
// require styles 引入样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
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
      dataListSelections: []
    }
  },
  components: {
    quillEditor
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
  },
  computed: {
    mainTabs: {
      get () { return this.$store.state.common.mainTabs },
      set (val) { this.$store.commit('common/updateMainTabs', val) }
    }
  },
  methods: {
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
        url: this.$http.adornUrl('/manage/video/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'title': this.dataForm.title
        })
      }).then((response) => {
        if (response && response.code === 200) {
          this.dataList = response.data.list
          this.dataList.forEach(x => {
            x.score = parseFloat(x.score)
          })
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
    // 修改
    updateHandle (id) {
      if (this.existTabHandle('video-video-update')) {
        this.$confirm(`已经存在视频修改页面，继续修改当前视频，将直接保存旧页面的视频内容!`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$router.replace({name: 'video-video-update', params: { id: id }})
        }).catch(() => {})
      } else {
        this.$router.replace({name: 'video-video-update', params: { id: id }})
      }
    },
    // 删除
    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.id
      })
      this.$confirm(`确定对这${ids.length}条数据进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/manage/video/delete'),
          method: 'delete',
          data: this.$http.adornData(ids, false)
        }).then((response) => {
          if (response && response.code === 200) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1000,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    // 更新视频推荐状态
    updateRecommend (id, value) {
      let data = {
        id: id,
        recommend: value
      }
      this.updateStatus(data)
    },
    // 更新视频发布状态
    updatePublish (id, value) {
      let data = {
        id: id,
        publish: value
      }
      this.updateStatus(data)
    },
    // 更新状态
    updateStatus (data) {
      this.$http({
        url: this.$http.adornUrl(`/manage/video/update/status`),
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
