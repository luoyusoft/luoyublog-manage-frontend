<template>
  <el-dialog
    :title="!dataForm.categoryId ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="120px">
      <el-form-item label="菜单级别" prop="rank">
        <el-radio-group v-model="dataForm.rank">
          <el-radio v-for="rank in rankList" :label="rank.parKey" :key="rank.parKey">{{ rank.parValue }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="getSysParam('CATEGORY_RANK',dataForm.rank,rankList)+'名称'" prop="name">
        <el-input v-model="dataForm.name" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item label="所属模块" prop="module">
        <el-select placeholder="请选择所属模块" clearable filterable v-model="dataForm.module" @change="getCategorySelect()">
          <el-option
            v-for="module in moduleList"
            :key="module.parKey"
            :label="module.parValue"
            :value="module.parKey">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="上级目录" prop="parentId">
        <el-popover
          ref="categoryListPopover"
          placement="bottom-start"
          trigger="click">
          <el-tree
            :data="categoryList"
            :props="categoryListTreeProps"
            node-key="id"
            ref="categoryListTree"
            @current-change="categoryListTreeCurrentChangeHandle"
            :default-expand-all="true"
            :highlight-current="true"
            :expand-on-click-node="false">
          </el-tree>
          <el-input v-model="dataForm.parentName" slot="reference" :readonly="true" placeholder="点击选择上级分类" class="menu-list__input"></el-input>
        </el-popover>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<style>
.el-popover{
  height: 200px;
overflow: auto;
}
</style>

<script>
import { treeDataTranslate } from '@/utils'
export default {
  data () {
    return {
      visible: false,
      dataForm: {
        rank: 0,
        module: '',
        parentId: 0,
        parentName: ''
      },
      dataRule: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        module: [
          { required: true, message: '类型不能为空', trigger: 'blur' }
        ],
        rank: [
          { required: true, message: '级别不能为空', trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: '父主键不能为空', trigger: 'blur' }
        ]
      },
      rankList: this.getSysParamArr('CATEGORY_RANK'),
      moduleList: this.getSysParamArr('MODULE_TYPE').filter(module => {
        if (module.parKey !== 2) {
          return module
        }
      }),
      categoryList: [],
      categoryListTreeProps: {
        label: 'name',
        children: 'children'
      }
    }
  },
  methods: {
    init (id) {
      this.dataForm.id = id || ''
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
      if (this.dataForm.id) {
        this.$http({
          url: this.$http.adornUrl(`/manage/operation/category/info/${this.dataForm.id}`),
          method: 'get',
          params: this.$http.adornParams()
        }).then((response) => {
          if (response && response.code === 200) {
            this.dataForm = response.data
          }
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/manage/operation/category/select'),
            method: 'get',
            params: this.$http.adornParams({module: this.dataForm.module})
          }).then((response) => {
            if (response && response.code === 200) {
              this.categoryList = treeDataTranslate(response.data)
              this.categoryListTreeSetCurrentNode()
            } else {
              this.categoryList = []
            }
          })
        })
      } else {
        this.dataForm = {
          rank: 0,
          module: '',
          parentId: 0,
          parentName: ''
        }
      }
    },
    // 获取目录列表
    getCategorySelect () {
      this.$http({
        url: this.$http.adornUrl('/manage/operation/category/select'),
        method: 'get',
        params: this.$http.adornParams({module: this.dataForm.module})
      }).then((response) => {
        if (response && response.code === 200) {
          this.categoryList = treeDataTranslate(response.data)
        } else {
          this.categoryList = []
        }
      })
    },
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl(`/manage/operation/category/${!this.dataForm.id ? 'save' : 'update'}`),
            method: !this.dataForm.id ? 'post' : 'put',
            data: this.$http.adornData(this.dataForm)
          }).then((response) => {
            if (response && response.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              this.$message.error(response.msg)
            }
          })
        }
      })
    },
    // 分类列表树选中
    categoryListTreeCurrentChangeHandle (data, node) {
      this.dataForm.parentId = data.id
      this.dataForm.parentName = data.name
    },
    // 分类列表树设置当前选中节点
    categoryListTreeSetCurrentNode () {
      this.$refs.categoryListTree.setCurrentKey(this.dataForm.parentId)
      this.dataForm.parentName = (this.$refs.categoryListTree.getCurrentNode() || {})['name']
    }
  }
}
</script>
