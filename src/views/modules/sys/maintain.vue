<template>
  <div class="mod-menu">
    <el-button type="warning" @click="cleanAllCache()">清除所有缓存</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    cleanAllCache () {
      this.$confirm(`确定进行"清除所有缓存"操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
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
      }).catch(() => {})
    }
  }
}
</script>
