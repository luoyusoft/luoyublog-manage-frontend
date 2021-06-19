<template>
  <aside class="site-sidebar" :class="'site-sidebar--' + sidebarLayoutSkin">
    <div class="site-sidebar__inner">
      <el-menu
        :default-active="menuActiveName || 'home'"
        :collapse="sidebarFold"
        :collapseTransition="false"
        class="site-sidebar__menu">
        <el-menu-item index="home" @click="goHome()">
          <icon-svg name="shouye" class="site-sidebar__menu-icon"></icon-svg>
          <span slot="title">首页</span>
        </el-menu-item>
        <el-menu-item index="theme" @click="goTheme()">
          <icon-svg name="zhuti" class="site-sidebar__menu-icon"></icon-svg>
          <span slot="title">主题</span>
        </el-menu-item>
        <sub-menu
          v-for="menu in menuList"
          :key="menu.id"
          :menu="menu"
          :dynamicMenuRoutes="dynamicMenuRoutes">
        </sub-menu>
      </el-menu>
    </div>
  </aside>
</template>

<script>
import SubMenu from './main-sidebar-sub-menu'
import { isURL } from '@/utils/validate'
export default {
  data () {
    return {
      dynamicMenuRoutes: []
    }
  },
  components: {
    SubMenu
  },
  computed: {
    sidebarLayoutSkin: {
      get () { return this.$store.state.common.sidebarLayoutSkin }
    },
    sidebarFold: {
      get () { return this.$store.state.common.sidebarFold }
    },
    menuList: {
      get () { return this.$store.state.common.menuList },
      set (val) { this.$store.commit('common/updateMenuList', val) }
    },
    menuActiveName: {
      get () { return this.$store.state.common.menuActiveName },
      set (val) { this.$store.commit('common/updateMenuActiveName', val) }
    },
    mainTabs: {
      get () { return this.$store.state.common.mainTabs },
      set (val) { this.$store.commit('common/updateMainTabs', val) }
    },
    mainTabsActiveName: {
      get () { return this.$store.state.common.mainTabsActiveName },
      set (val) { this.$store.commit('common/updateMainTabsActiveName', val) }
    }
  },
  watch: {
    $route: 'routeHandle'
  },
  created () {
    this.menuList = JSON.parse(sessionStorage.getItem('menuList') || '[]')
    this.dynamicMenuRoutes = JSON.parse(sessionStorage.getItem('dynamicMenuRoutes') || '[]')
    this.routeHandle(this.$route)
  },
  methods: {
    goHome () {
      if (this.$route.path.replace(/\//g, '') === 'theme') {
        this.$router.push({ name: 'home' })
      } else if (this.$route.path.replace(/\//g, '') !== 'home') {
        this.$confirm(`返回首页将关闭当前打开的所有标签页!`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$router.push({ name: 'home' })
        }).catch(() => {})
      }
    },
    goTheme () {
      if (this.$route.path.replace(/\//g, '') === 'home') {
        this.$router.push({ name: 'theme' })
      } else if (this.$route.path.replace(/\//g, '') !== 'theme') {
        this.$confirm(`设置主题将关闭当前打开的所有标签页!`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$router.push({ name: 'theme' })
        }).catch(() => {})
      }
    },
    // 路由操作
    routeHandle (route) {
      if (route.meta.isTab) {
        // tab选中, 不存在先添加
        var tab = this.mainTabs.filter(item => item.name === route.name)[0]
        if (!tab) {
          if (route.meta.isDynamic) {
            route = this.dynamicMenuRoutes.filter(item => item.name === route.name)[0]
            if (!route) {
              return console.error('未能找到可用标签页!')
            }
          }
          tab = {
            id: route.meta.id || route.name,
            name: route.name,
            title: route.meta.title,
            type: isURL(route.meta.iframeUrl) ? 'iframe' : 'module',
            iframeUrl: route.meta.iframeUrl || ''
          }
          this.mainTabs = this.mainTabs.concat(tab)
        }
        this.menuActiveName = tab.id + ''
        this.mainTabsActiveName = tab.name
      }
    }
  }
}
</script>
