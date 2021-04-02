<template>
  <div class="simple-upload-container">
    <div class="total-progress">
      <div class="btns">
        <el-button-group>
          <el-button :disabled="changeDisabled">
            <i class="el-icon-upload2 el-icon--left" size="mini"></i>选择文件
            <input
              v-if="!changeDisabled"
              type="file"
              :multiple="multiple"
              class="select-file-input"
              :accept="accept"
              οnclick="f.outerHTML=f.outerHTML"
              @change="handleFileChange"
            />
          </el-button>
          <el-button :disabled="uploadDisabled" @click="handleUpload"><i class="el-icon-upload el-icon--left" size="mini"></i>上传</el-button>
          <el-button :disabled="pauseDisabled" @click="handlePause"><i class="el-icon-video-pause el-icon--left" size="mini"></i>暂停</el-button>
          <el-button :disabled="resumeDisabled" @click="handleResume"><i class="el-icon-video-play el-icon--left" size="mini"></i>恢复</el-button>
          <el-button :disabled="clearDisabled" @click="clearFiles"><i class="el-icon-video-play el-icon--left" size="mini"></i>清空</el-button>
        </el-button-group>
        <slot name="header"></slot>
      </div>
    </div>
    <div class="file-list">
      <el-collapse v-if="uploadFiles.length" accordion>
        <el-collapse-item v-for="(item, index) in uploadFiles" :key="index">
          <template slot="title">
            <div class="progress-box">
              <div class="list-item">
                <div class="item-name">
                  <span>{{ index + 1 }}：名称：{{ item.name }}</span>
                </div>
                <div class="item-size">大小：{{ item.size | transformByte }}</div>
                <div v-if="item.hashProgress !== 100" class="item-progress">
                  <span>{{ status === 'wait' ? '准备读取文件' : '正在读取文件' }}：</span>
                  <el-progress :percentage="item.hashProgress" />
                </div>
                <div v-else class="item-progress"><span>文件进度：</span><el-progress :percentage="item.uploadProgress" /></div>
                <div class="item-status">
                  <i :class="fileStatuIcon(item.status)"></i>
                  {{ item.status | fileStatus }}
                </div>
              </div>
            </div>
          </template>
          <div class="item-chunk-box">
            <el-table :data="item.chunkList" border max-height="300">
              <el-table-column prop="index" label="分片序号" align="center" />
              <el-table-column prop="hash" label="文件md5" align="center" show-overflow-tooltip />
              <el-table-column label="分片大小" align="center" width="120">
                <template v-slot="{ row }">
                  {{ row.size | transformByte }}
                </template>
              </el-table-column>
              <el-table-column prop="uploaded" label="是否完成" align="center">
                <template v-slot="{ row }">
                  {{ row.uploaded ? '完成' : '进行中' }}
                </template>
              </el-table-column>

              <el-table-column label="进度" align="center">
                <template v-slot="{ row }">
                  <el-progress v-if="!row.status || row.status === 'wait'" :percentage="row.progress" />
                  <el-progress v-else :percentage="row.progress" :status="row.status" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>
      </el-collapse>
      <slot name="tip"></slot>
    </div>
  </div>
</template>
<script>
import { CancelToken } from 'axios'

// 默认切片大小
var chunkSize = 100 * 1024 * 1024
// 当前正在被遍历的文件下标
var fileIndex = 0

// 所有文件状态
const Status = {
  wait: 'wait',
  pause: 'pause',
  uploading: 'uploading',
  hash: 'hash',
  error: 'error',
  done: 'done'
}
// 单个文件的状态
const fileStatus = {
  wait: 'wait',
  uploading: 'uploading',
  success: 'success',
  error: 'error',
  secondPass: 'secondPass',
  pause: 'pause',
  resume: 'resume'
}
// 单个文件的状态 对应描述
const fileStatusStr = {
  wait: '待上传',
  uploading: '上传中',
  success: '成功',
  error: '失败',
  secondPass: '已秒传',
  pause: '暂停',
  resume: '恢复'
}

export default {
  name: 'uploader-container',
  filters: {
    transformByte (size) {
      if (!size) {
        return '0B'
      }

      var num = 1024.0 // byte

      if (size < num) {
        return size + 'B'
      }
      if (size < Math.pow(num, 2)) {
        return (size / num).toFixed(2) + 'K'
      } // kb
      if (size < Math.pow(num, 3)) {
        return (size / Math.pow(num, 2)).toFixed(2) + 'M'
      } // M
      if (size < Math.pow(num, 4)) {
        return (size / Math.pow(num, 3)).toFixed(2) + 'G'
      } // G
      return (size / Math.pow(num, 4)).toFixed(2) + 'T' // T
    },
    // 单个文件状态格式化
    fileStatus (status) {
      return fileStatusStr[fileStatus[status]]
    }
  },
  props: {
    beforeUpload: {
      type: Function,
      default: null
    },
    module: {
      type: Number,
      default: 99
    },
    accept: {
      type: String,
      default: ''
    },
    // 上传文件时携带的参数
    uploadArguments: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 是否传递cookie
    withCredentials: {
      type: Boolean,
      default: false
    },
    // 文件个数
    limit: {
      type: Number,
      default: 0
    },
    // 文件超出个数限制时的钩子
    onExceed: {
      type: Function,
      default: () => {}
    },
    multiple: {
      type: Boolean,
      default: true
    },
    // 切片大小
    chunkSize: {
      type: Number,
      default: 10 * 1024 * 1024
    },
    // 上传并发数
    threads: {
      type: Number,
      default: 3
    },
    // 错误重试次数
    chunkRetry: {
      type: Number,
      default: 3
    }
  },
  data: () => ({
    uploadFiles: [],
    worker: null,
    // 存储要取消的请求
    cancels: [],
    tempThreads: 3,
    // 默认状态
    status: Status.wait
  }),
  computed: {
    changeDisabled () {
      return ![Status.wait, Status.done].includes(this.status)
    },
    uploadDisabled () {
      return !this.uploadFiles.length || [Status.pause, Status.done, Status.uploading, Status.hash].includes(this.status)
    },
    pauseDisabled () {
      return [Status.hash, Status.wait, Status.done, Status.pause].includes(this.status)
    },
    resumeDisabled () {
      return ![Status.pause].includes(this.status)
    },
    clearDisabled () {
      return !this.uploadFiles.length
    },
    fileStatuIcon (status) {
      return function (status) {
        var className = ''
        switch (status) {
          case 'uploading':
            className = 'el-icon-loading'
            break
          case 'success':
          case 'secondPass':
            className = 'el-icon-circle-check'
            break
          case 'error':
            className = 'el-icon-circle-close'
            break
        }
        return className + ' el-icon--left'
      }
    }
  },
  destroyed () {
    this.clearFiles()
  },
  created () {
    this.setChunkSize()
    this.tempThreads = this.threads
  },
  methods: {
    handleFileChange (e) {
      const files = e.target.files
      console.log('文件列表改变：', files)
      if (!files) return

      // 重置文件下标
      fileIndex = 0
      console.log('当前文件列表：', this.uploadFiles)
      // 判断文件选择的个数
      if (this.limit && files.length > this.limit) {
        this.onExceed && this.onExceed(files)
        return
      }

      this.status = Status.wait

      const postFiles = Array.prototype.slice.call(files)
      console.log('当前文件：', postFiles)
      postFiles.forEach((item) => {
        this.handleStart(item)
      })
    },
    handleStart (rawFile) {
      // 初始化部分自定义属性
      rawFile.status = fileStatus.wait
      rawFile.chunkList = []
      rawFile.uploadProgress = 0
      // 假进度条，处理恢复上传后，进度条后移的问题
      rawFile.fakeUploadProgress = 0
      rawFile.hashProgress = 0

      if (this.beforeUpload) {
        const before = this.beforeUpload(rawFile)
        if (before && before.then) {
          before.then((response) => {
            this.uploadFiles.push(rawFile)
          })
        }
      }

      if (!this.beforeUpload) {
        this.uploadFiles.push(rawFile)
      }
    },
    // 进行上传
    async handleUpload () {
      console.log('开始上传，文件列表：', this.uploadFiles)
      if (!this.uploadFiles) return
      this.status = Status.uploading
      const filesArr = this.uploadFiles

      // 遍历表单里的文件
      for (let i = 0; i < filesArr.length; i++) {
        fileIndex = i
        if (['secondPass', 'success', 'error'].includes(filesArr[i].status)) {
          console.log('跳过已上传成功或已秒传的或失败的')
          continue
        }
        // 进行分片切割
        const fileChunkList = this.createFileChunk(filesArr[i])

        // 若不是恢复，再进行hash计算
        if (filesArr[i].status !== 'resume') {
          this.status = Status.hash
          // hash校验，是否为秒传
          filesArr[i].hash = await this.calculateHash(fileChunkList)

          // 若清空或者状态为等待，则跳出循环
          if (this.status === Status.wait) {
            console.log('若清空或者状态为等待，则跳出循环')
            break
          }

          console.log('当前文件md5：', filesArr[i].hash)
        }

        this.status = Status.uploading

        // 分片上传文件，获取各个分片上传地址
        const chunkUploadRes = await this.chunk(filesArr[i].name, filesArr[i].hash, filesArr[i].size, fileChunkList.length)

        if (chunkUploadRes.length < 1) {
          filesArr[i].status = fileStatus.secondPass
          filesArr[i].uploadProgress = 100
          this.$http({
            url: this.$http.adornUrl('/manage/file/resource/minio/url'),
            method: 'get',
            params: this.$http.adornParams({
              fileMd5: filesArr[i].hash,
              module: this.module
            })
          }).then((response) => {
            if (response && response.code === 200) {
              this.isAllStatus(response.data)
            } else {
              this.$message.error('获取文件访问地址失败：' + response.msg)
            }
          })
        } else {
          console.log('开始上传，当前文件名称：', filesArr[i].name)
          filesArr[i].status = fileStatus.uploading

          for (let j = 0; j < chunkUploadRes.length; j++) {
            if (chunkUploadRes[j].uploadStatus === 1) {
              this.addChunkStorage(filesArr[i].hash, j)
            }
            chunkUploadRes[j].file = fileChunkList[j].file
          }

          const getChunkStorage = this.getChunkStorage(filesArr[i].hash)
          // 文件的hash，合并时使用
          filesArr[i].fileHash = filesArr[i].hash
          filesArr[i].chunkList = chunkUploadRes.map(({ uploadUrl, file }, index) => ({
            fileHash: filesArr[i].hash,
            fileName: filesArr[i].name,
            uploadUrl: uploadUrl,
            index,
            hash: filesArr[i].hash,
            data: file,
            size: file.size,
            // 标识：是否已完成上传
            uploaded: getChunkStorage && getChunkStorage.includes(index),
            progress: getChunkStorage && getChunkStorage.includes(index) ? 100 : 0,
            // 上传状态，用作进度状态显示
            status: getChunkStorage && getChunkStorage.includes(index) ? 'success' : 'wait'
          }))

          this.$set(filesArr, i, filesArr[i])

          console.log('上传文件，进行切片处理：', filesArr[i])
          await this.uploadChunks(filesArr[i])
        }
      }
    },
    // 将切片传输给服务端
    async uploadChunks (data) {
      console.log('开始传到minio：', data)
      var chunkData = data.chunkList
      return new Promise(async (resolve, reject) => {
        try {
          const ret = await this.sendRequest(chunkData)
          console.log('传到minio结果：', ret)
        } catch (error) {
          // 上传有被reject的
          this.$message.error('上传文件失败：' + error)
          return
        }

        // 合并切片
        const isUpload = chunkData.some((item) => item.uploaded === false)
        console.log('进行合并：', isUpload)
        if (isUpload) {
          this.$message.error('进行合并失败：存在上传失败的切片')
        } else {
          // 执行合并
          try {
            await this.mergeRequest(data)
            resolve()
          } catch (error) {
            reject(new Error(error))
          }
        }
      })
    },
    // 并发处理
    sendRequest (list) {
      console.log('上传文件，切片列表并发请求：', list)
      const chunkData = []
      list.forEach(x => {
        chunkData.push(x)
      })
      var finished = 0
      const total = chunkData.length
      const that = this
      // 数组存储每个文件hash请求的重试次数，做累加 比如[1,0,2],就是第0个文件切片报错1次，第2个报错2次
      const retryArr = []

      return new Promise((resolve, reject) => {
        const handler = () => {
          if (chunkData.length) {
            // 出栈
            const formData = chunkData.shift()
            const index = formData.index
            let fileFormData = new FormData()
            fileFormData.append('file', formData.data)
            fileFormData.append('uploadUrl', formData.uploadUrl)
            this.$http({
              url: this.$http.adornUrl('/manage/file/resource/minio/chunkUpload'),
              method: 'post',
              data: fileFormData,
              headers: { 'Content-Type': 'multipart/form-data' },
              onUploadProgress: that.createProgresshandler(list[index]),
              cancelToken: new CancelToken((c) => this.cancels.push(c)),
              timeout: 0
            }).then((response) => {
              console.log('上传文件，minio响应：', response)
              this.$http({
                url: this.$http.adornUrl('/manage/file/resource/minio/chunkUploadSuccess'),
                method: 'put',
                data: this.$http.adornData({
                  'fileMd5': formData.fileHash,
                  'module': this.module,
                  'chunkNumber': index
                })
              }).then((response) => {
                if (response && response.code === 200) {
                  console.log('单个分片状态修改成功：', index)

                  // 更改状态
                  list[index].uploaded = true
                  list[index].status = 'success'

                  // 存储已上传的切片下标
                  this.addChunkStorage(list[index].fileHash, index)

                  finished++
                  handler()
                } else {
                  console.log('单个分片状态修改失败：', response.msg)
                }
              })
            }).catch((e) => {
              // 若状态为暂停或等待，则禁止重试
              console.log('当前状态：', this.status)
              if ([Status.pause, Status.wait].includes(this.status)) return

              console.warn('出现错误', e)
              console.log('重试列表：', retryArr)
              if (typeof retryArr[index] !== 'number') {
                retryArr[index] = 0
              }

              // 更新状态
              list[index].status = 'warning'

              // 累加错误次数
              retryArr[index]++

              // 重试3次
              if (retryArr[index] >= this.chunkRetry) {
                console.warn(' 重试失败--- > handler -> retryArr', retryArr, list[index].hash)
                return reject(new Error('重试失败' + retryArr))
              }

              console.log('重试操作：', `${list[index].hash}--进行第 ${retryArr[index]} '次重试'`)
              console.log(retryArr)

              this.tempThreads++ // 释放当前占用的通道

              // 将失败的重新加入队列
              chunkData.push(formData)
              handler()
            })
          }

          if (finished >= total) {
            resolve('成功')
          }
        }

        // 控制并发
        for (let i = 0; i < this.tempThreads; i++) {
          handler()
        }
      })
    },
    // 通知服务端合并切片
    mergeRequest (data) {
      return new Promise((resolve, reject) => {
        this.$http({
          url: this.$http.adornUrl('/manage/file/resource/minio/compose'),
          method: 'post',
          data: this.$http.adornData({
            'fileMd5': data.fileHash,
            'fileName': data.name,
            'module': this.module,
            'chunkCount': data.chunkList.length
          })
        }).then((response) => {
          // 清除storage
          if (response && response.code === 200) {
            data.status = fileStatus.success
            localStorage.removeItem(data.fileHash)
            // 判断是否所有都成功上传
            this.isAllStatus(response.data)
            resolve()
          } else {
            // 文件块数量不对，清除缓存
            this.$message.success('合并分片失败：' + response.msg)
            localStorage.removeItem(data.fileHash)
            data.status = fileStatus.error
            this.status = Status.wait
            resolve()
          }
        }).catch((err) => {
          console.log('合并分片失败：', err)
          data.status = fileStatus.error
          reject(new Error(err))
        })
      })
    },
    // 创建文件切片
    createFileChunk (file, size = chunkSize) {
      const fileChunkList = []
      var count = 0
      while (count < file.size) {
        fileChunkList.push({
          file: file.slice(count, count + size)
        })
        count += size
      }
      console.log('创建文件切片列表：', fileChunkList)
      return fileChunkList
    },
    // 暂停上传
    handlePause () {
      this.status = Status.pause
      if (this.uploadFiles.length) {
        const currentFile = this.uploadFiles[fileIndex]
        currentFile.status = fileStatus.pause
        // 将当前进度赋值给假进度条
        currentFile.fakeUploadProgress = currentFile.uploadProgress
        console.log('暂停上传：', currentFile)
      }
      while (this.cancels.length > 0) {
        this.cancels.pop()('取消请求')
      }
    },
    // 恢复上传
    handleResume () {
      this.status = Status.uploading
      console.log('恢复上传：', this.uploadFiles[fileIndex])
      this.uploadFiles[fileIndex].status = fileStatus.resume
      this.handleUpload()
    },
    // 分片上传文件，获取各个分片上传地址
    chunk (fileName, fileHash, size, chunkCount) {
      return new Promise((resolve) => {
        this.$http({
          url: this.$http.adornUrl('/manage/file/resource/minio/chunk'),
          method: 'post',
          data: this.$http.adornData({
            'fileMd5': fileHash,
            'fileName': fileName,
            'module': this.module,
            'fileSize': size,
            'chunkCount': chunkCount
          })
        }).then((response) => {
          if (response && response.code === 200) {
            resolve(response.data)
          } else {
            this.$message.error(response.msg)
          }
        }).catch((err) => {
          console.log('获取各个分片上传地址失败：', err)
        })
      })
    },
    // 生成文件 hash（web-worker）
    calculateHash (fileChunkList) {
      console.log('计算文件md5：', fileChunkList)
      return new Promise((resolve) => {
        this.worker = new Worker('./static/md5/hash.js')
        this.worker.postMessage({ fileChunkList })
        this.worker.onmessage = (e) => {
          const { percentage, hash } = e.data
          if (this.uploadFiles[fileIndex]) {
            this.uploadFiles[fileIndex].hashProgress = Number(percentage.toFixed(0))
            this.$set(this.uploadFiles, fileIndex, this.uploadFiles[fileIndex])
          }
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    // 切片上传进度
    createProgresshandler (item) {
      console.log('实时处理切片上传进度：', item)
      return (p) => {
        item.progress = parseInt(String((p.loaded / p.total) * 100))
        this.fileProgress()
      }
    },
    // 文件总进度
    fileProgress () {
      const currentFile = this.uploadFiles[fileIndex]
      if (currentFile) {
        const uploadProgress = currentFile.chunkList.map((item) => item.size * item.progress).reduce((acc, cur) => acc + cur)
        const currentFileProgress = parseInt((uploadProgress / currentFile.size).toFixed(2))

        // 真假进度条处理--处理进度条后移
        if (!currentFile.fakeUploadProgress) {
          currentFile.uploadProgress = currentFileProgress
          this.$set(this.uploadFiles, fileIndex, currentFile)
        } else if (currentFileProgress > currentFile.fakeUploadProgress) {
          currentFile.uploadProgress = currentFileProgress
          this.$set(this.uploadFiles, fileIndex, currentFile)
        }
      }
    },
    // 存储已上传完成的切片
    addChunkStorage (name, index) {
      const data = [index]
      console.log('存储已上传完成的切片：', name, data)
      const arr = this.getChunkStorage(name)
      arr.push(index)
      localStorage.setItem(name, JSON.stringify(arr))
    },
    // 获取已上传完成的切片下标
    getChunkStorage (name) {
      if (localStorage.getItem(name)) {
        return JSON.parse(localStorage.getItem(name))
      }
      return []
    },
    // 设置切片大小
    setChunkSize () {
      // 设置切片大小
      chunkSize = this.chunkSize
    },
    // 清空文件
    clearFiles () {
      console.log('清空文件')
      this.uploadFiles.forEach(x => {
        localStorage.removeItem(x.chunkList[0].hash)
      })
      fileIndex = 0
      this.handlePause()
      // 中断worker
      this.worker && this.worker.terminate()
      this.status = Status.wait
      // 重置data所有数据
      Object.assign(this.$data, this.$options.data())
    },
    // 判断是否都已完成上传
    isAllStatus (url) {
      const isAllSuccess = this.uploadFiles.every((item) => ['success', 'secondPass', 'error'].includes(item.status))
      if (isAllSuccess) {
        this.status = Status.done
        this.$emit('successUpload', url)
      }
    }
  }
}
</script>
<style scoped lang="scss">
.simple-upload-container {
  width: 100%;
  border: 1px solid #d2d2d2;
  border-radius: 4px;
  background-color: #fff;
  padding-bottom: 15px;
  padding: 10px;
  .progress-box {
    width: 100%;
  }
  .total-progress {
    margin-bottom: 15px;
    .btns {
      position: relative;
      .select-file-input {
        position: absolute;
        display: inline-block;
        left: 0;
        top: 0;
        border: none;
        opacity: 0;
        width: 96px;
        height: 28px;
      }
    }
  }

  .file-list {
    .list-item {
      padding: 8px 10px;
      display: flex;
      justify-content: center;
      justify-items: center;
      line-height: 25px;
      position: relative;
      &:hover .item-chunk-box {
        display: block;
      }
      div {
        flex: 1;
        margin-top: 6px;
      }
      .item-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 6px;
        .svg-icon {
          font-size: 22px;
          vertical-align: sub;
        }
      }
      .item-status {
        flex: 0 0 10%;
        text-align: center;
        text-align: left;
        .el-icon-circle-check {
          color: #67c23a;
        }
        .el-icon-circle-close {
          color: #f00;
        }
      }
      .item-chunk-box {
        display: none;
        transition: all 3s;
        position: absolute;
        top: 0;
        left: 40px;
        z-index: 10;
      }
      .item-progress {
        flex: 0 0 60%;
      }
    }
  }

  .upload-tip {
    font-size: 12px;
    color: #606266;
    margin-top: 7px
  }

  .el-progress {
    width: 80%;
    display: inline-block;
  }

  >>> .el-collapse-item__header {
    height: auto
  }
}
</style>
