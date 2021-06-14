<template>
  <nav class="site-navbar" :class="'site-navbar--' + navbarLayoutType">
    <div class="site-navbar__header">
      <h1 class="site-navbar__brand" @click="$router.push({ name: 'home' })">
        <a class="site-navbar__brand-lg" href="javascript:">Jinhx</a>
<!--        <a class="site-navbar__brand-mini" href="javascript:;">Jinhx</a>-->
      </h1>
    </div>
    <div class="site-navbar__body clearfix">
      <el-menu
        class="site-navbar__menu"
        mode="horizontal">
        <el-menu-item class="site-navbar__switch" index="0" @click="sidebarFold = !sidebarFold">
          <icon-svg v-if="!sidebarFold" name="zhedie"></icon-svg>
          <icon-svg v-if="sidebarFold" name="zhankai"></icon-svg>
        </el-menu-item>
      </el-menu>
      <el-menu
        class="site-navbar__menu site-navbar__menu--right"
        mode="horizontal">
        <!--<el-menu-item index="1" @click="$router.push({ name: 'theme' })">-->
          <!--<template slot="title">-->
            <!--<el-badge value="new">-->
              <!--<icon-svg name="shezhi" class="el-icon-setting"></icon-svg>-->
            <!--</el-badge>-->
          <!--</template>-->
        <!--</el-menu-item>-->

        <!--<el-submenu index="3">-->
          <!--<template slot="title">实验室</template>-->
          <!--<el-menu-item index="2-1"><a href="#" target="_blank">前端</a></el-menu-item>-->
          <!--<el-menu-item index="2-2"><a href="#" target="_blank">后台</a></el-menu-item>-->
          <!--<el-menu-item index="2-3"><a href="#" target="_blank">代码生成器</a></el-menu-item>-->
        <!--</el-submenu>-->
        <el-menu-item class="site-navbar__avatar" index="3">
          <el-dropdown :show-timeout="0" placement="bottom">
            <span class="el-dropdown-link">
              <img :src="profile" :alt="nickname">{{ nickname }}
            </span>
            <el-dropdown-menu slot="dropdown">
<!--              <el-dropdown-item @click.native="updatePasswordHandle()">修改密码</el-dropdown-item>-->
              <el-dropdown-item @click.native="addOrUpdateHandle()">修改信息</el-dropdown-item>
              <el-dropdown-item @click.native="logoutHandle()">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-menu-item>
      </el-menu>
    </div>
    <!-- 弹窗, 修改密码 -->
<!--    <update-password v-if="updatePassowrdVisible" ref="updatePassowrd"></update-password>-->
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </nav>
</template>

<script>
import UpdatePassword from './main-navbar-update-password'
import AddOrUpdate from './modules/sys/user-add-or-update'
import { clearLoginInfo } from '@/utils'
export default {
  data () {
    return {
      addOrUpdateVisible: false,
      updatePassowrdVisible: false
    }
  },
  components: {
    UpdatePassword,
    AddOrUpdate
  },
  computed: {
    navbarLayoutType: {
      get () { return this.$store.state.common.navbarLayoutType }
    },
    sidebarFold: {
      get () { return this.$store.state.common.sidebarFold },
      set (val) { this.$store.commit('common/updateSidebarFold', val) }
    },
    mainTabs: {
      get () { return this.$store.state.common.mainTabs },
      set (val) { this.$store.commit('common/updateMainTabs', val) }
    },
    nickname: {
      get () { return this.$store.state.user.nickname }
    },
    profile: {
      get () { return this.$store.state.user.profile }
    },
    userId: {
      get () { return this.$store.state.user.userId }
    }
  },
  methods: {
    // 修改密码
    updatePasswordHandle () {
      this.updatePassowrdVisible = true
      this.$nextTick(() => {
        this.$refs.updatePassowrd.init()
      })
    },
    // 修改
    addOrUpdateHandle () {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(this.userId)
      })
    },
    getDataList () {
    },
    // 退出
    logoutHandle () {
      this.$confirm(`确定进行[退出]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
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
      }).catch(() => {})
    }
  }
}
</script>
