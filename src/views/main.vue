<template>
  <div
    class="site-wrapper"
    :class="{ 'site-sidebar--fold': sidebarFold }"
    v-loading.fullscreen.lock="loading"
    element-loading-text="拼命加载中">
    <template v-if="!loading">
      <main-navbar />
      <main-sidebar />
      <div class="site-content__wrapper" :style="{ 'min-height': documentClientHeight + 'px' }">
        <main-content />
      </div>
    </template>
  </div>
</template>

<script>
import MainNavbar from './main-navbar'
import MainSidebar from './main-sidebar'
import MainContent from './main-content'
export default {
  data () {
    return {
      loading: true
    }
  },
  components: {
    MainNavbar,
    MainSidebar,
    MainContent
  },
  computed: {
    documentClientHeight: {
      get () { return this.$store.state.common.documentClientHeight },
      set (val) { this.$store.commit('common/updateDocumentClientHeight', val) }
    },
    sidebarFold: {
      get () { return this.$store.state.common.sidebarFold }
    },
    userId: {
      get () { return this.$store.state.user.userId },
      set (val) { this.$store.commit('user/updateUserId', val) }
    },
    nickname: {
      get () { return this.$store.state.user.nickname },
      set (val) { this.$store.commit('user/updateNickname', val) }
    },
    profile: {
      get () { return this.$store.state.user.profile },
      set (val) { this.$store.commit('user/updateProfile', val) }
    }
  },
  created: function () {
    this.getUserInfo()
    this.listSysParam()
  },
  mounted: function () {
    this.resetDocumentClientHeight()
  },
  methods: {
    // 重置窗口可视高度
    resetDocumentClientHeight () {
      this.documentClientHeight = document.documentElement['clientHeight']
      window.onresize = () => {
        this.documentClientHeight = document.documentElement['clientHeight']
      }
    },
    // 获取当前用户信息
    getUserInfo () {
      this.$http({
        url: this.$http.adornUrl('/manage/sys/user/info'),
        method: 'get',
        params: this.$http.adornParams()
      }).then((response) => {
        if (response && response.code === 200) {
          this.loading = false
          this.userId = response.data.id
          this.nickname = response.data.nickname
          this.profile = response.data.profile
        }
      })
    },
    // 获取参数
    listSysParam () {
      this.$http({
        url: this.$http.adornUrl('/manage/sys/param/all'),
        method: 'get',
        params: this.$http.adornParams()
      }).then((response) => {
        if (response && response.code === 200) {
          localStorage.setItem('sysParamList', JSON.stringify(response.data))
        }
      })
    }
  }
}
</script>
<style>
  .form-input {
    width: 100px
  }
</style>
