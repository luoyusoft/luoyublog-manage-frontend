<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="$router.push({ name: 'log-log' })">
<!--        <div class="card-panel-icon-wrapper icon-people">-->
        <div class="card-panel-icon-wrapper icon-people">
          <icon-svg name="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description" style="margin: 10px 0 0 10px" >
<!--          <div class="card-panel-text">New Visits</div>-->
<!--          <count-to :start-val="0" :end-val="102400" :duration="2600" class="card-panel-num"/>-->
          <span>今天PV：</span><count-to :start-val="0" :end-val="hommeInfo.logInfo.todayPV" :duration="3600" class="card-panel-num"/><br>
          <span>今天UV：</span><count-to :start-val="0" :end-val="hommeInfo.logInfo.todayUV" :duration="3600" class="card-panel-num"/><br>
          <span>总PV：</span><count-to :start-val="0" :end-val="hommeInfo.logInfo.allPV" :duration="3600" class="card-panel-num"/><br>
          <span>总UV：</span><count-to :start-val="0" :end-val="hommeInfo.logInfo.allUV" :duration="3600" class="card-panel-num"/>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="$router.push({ name: 'article-article' })">
        <div class="card-panel-icon-wrapper icon-shopping">
          <icon-svg name="articles" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <!--          <div class="card-panel-text">Articles</div>-->
          <span>已发布：</span><count-to :start-val="0" :end-val="hommeInfo.articleInfo.publishCount" :duration="3600" class="card-panel-num"/><br>
          <span>总量：</span><count-to :start-val="0" :end-val="hommeInfo.articleInfo.allCount" :duration="3600" class="card-panel-num"/>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="$router.push({ name: 'video-video' })">
        <div class="card-panel-icon-wrapper icon-message">
          <icon-svg name="videos" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
<!--          <div class="card-panel-text">Messages</div>-->
          <span>已发布：</span><count-to :start-val="0" :end-val="hommeInfo.videoInfo.publishCount" :duration="3600" class="card-panel-num"/><br>
          <span>总量：</span><count-to :start-val="0" :end-val="hommeInfo.videoInfo.allCount" :duration="3600" class="card-panel-num"/>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="$router.push({ name: 'operation-friendlink' })">
        <div class="card-panel-icon-wrapper icon-money">
          <icon-svg name="like" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
<!--          <div class="card-panel-text">友链</div>-->
          <span>友链量：</span><count-to :start-val="0" :end-val="hommeInfo.friendLinkInfo.count" :duration="3600" class="card-panel-num"/><br>
          <span>推荐量：</span><count-to :start-val="0" :end-val="hommeInfo.recommendInfo.count" :duration="3600" class="card-panel-num"/>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  data () {
    return {
      hommeInfo: {
        articleInfo: {
          publishCount: 0,
          allCount: 0
        },
        videoInfo: {
          publishCount: 0,
          allCount: 0
        },
        logInfo: {
          todayPV: 0,
          todayUV: 0,
          allPV: 0,
          allUV: 0
        },
        friendLinkInfo: {
          count: 0
        },
        recommendInfo: {
          count: 0
        }
      }
    }
  },
  components: {
    CountTo
  },
  activated () {
    this.getHommeInfo()
  },
  methods: {
    handleSetLineChartData (type) {
      this.$emit('handleSetLineChartData', type)
    },
    // 获取首页数据
    getHommeInfo () {
      this.$http({
        url: this.$http.adornUrl('/manage/article/homeinfo'),
        method: 'get'
      }).then((response) => {
        if (response && response.code === 200) {
          this.hommeInfo.articleInfo = response.data
        } else {
          this.$message.error(response.msg)
        }
      })
      this.$http({
        url: this.$http.adornUrl('/manage/video/homeinfo'),
        method: 'get'
      }).then((response) => {
        if (response && response.code === 200) {
          this.hommeInfo.videoInfo = response.data
        } else {
          this.$message.error(response.msg)
        }
      })
      this.$http({
        url: this.$http.adornUrl('/manage/log/homeinfo'),
        method: 'get'
      }).then((response) => {
        if (response && response.code === 200) {
          this.hommeInfo.logInfo = response.data
        } else {
          this.$message.error(response.msg)
        }
      })
      this.$http({
        url: this.$http.adornUrl('/manage/operation/friendlink/homeinfo'),
        method: 'get'
      }).then((response) => {
        if (response && response.code === 200) {
          this.hommeInfo.friendLinkInfo = response.data
        } else {
          this.$message.error(response.msg)
        }
      })
      this.$http({
        url: this.$http.adornUrl('/manage/operation/recommend/homeinfo'),
        method: 'get'
      }).then((response) => {
        if (response && response.code === 200) {
          this.hommeInfo.recommendInfo = response.data
        } else {
          this.$message.error(response.msg)
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.panel-group {
  margin-top: 18px;
  .card-panel-col{
    margin-bottom: 32px;
  }
  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .1);
    border-color: rgba(0, 0, 0, .1);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
         background: #40c9c6;
      }
      .icon-message {
        background: #36a3f7;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shopping {
        background: #34bfa3
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-message {
      color: #36a3f7;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shopping {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 8px 0 10px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      //float: right;
      font-weight: bold;
      margin: 26px 26px 26px 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 15px;
        color: red;
      }
    }
  }
}
</style>
