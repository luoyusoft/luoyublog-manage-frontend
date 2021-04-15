<template>
  <div class="mod-menu">
    <el-button type="warning" @click="cleanAllCache()">清除所有缓存</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    cleanAllCache () {
      this.$http({
        url: this.$http.adornUrl('/manage/cache/cleanAll'),
        method: 'delete'
      }).then((response) => {
        if (response && response.code === 200) {
          this.$message.success('清除成功')
        } else {
          this.$message.error(response.msg)
        }
      })
    }
  }
}
</script>
