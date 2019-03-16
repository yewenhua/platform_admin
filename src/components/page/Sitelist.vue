<template>
    <div>
        <PageTitle title="网站列表"></PageTitle>
        <div class="pageWrapper">
            <div class="lookWrapper" v-show="!edit">
                <div class="searchWrapper">
                    <el-input placeholder="请输入搜索内容" v-model="searchkey" size="medium">
                        <el-button slot="append" size="medium" icon="el-icon-search" @click="search"></el-button>
                    </el-input>
                    <el-button type="primary" size="medium" class="addBtn" icon="el-icon-plus" @click="add" v-if="hasPermission('admin/sitelist', 'add')">添加</el-button>
                </div>
                <el-table
                        ref="table"
                        :data="tableData"
                        stripe
                        border
                        empty-text="暂无数据"
                        v-loading="loading"
                        cell-class-name="txt-center"
                        header-cell-class-name="txt-center"
                        @selection-change="handleSelectionChange"
                        style="width: 100%">
                    <el-table-column
                            type="selection"
                            width="70">
                    </el-table-column>
                    <el-table-column
                            type="index"
                            :index="indexMethod">
                    </el-table-column>
                    <el-table-column
                            prop="name"
                            label="网站名称">
                    </el-table-column>
                    <el-table-column
                            prop="alias"
                            label="网站别名">
                    </el-table-column>
                    <el-table-column
                            prop="url"
                            label="网站URL">
                    </el-table-column>
                    <el-table-column
                            prop="isopen"
                            label="状态">
                        <template slot-scope="scope">
                            <div class="status" :class="scope.row.isopen == 1 ? 'active' : 'unactive'">{{scope.row.isopen == 1 ? '启用中' : '停用中'}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="created_at"
                            label="创建时间">
                        <template slot-scope="scope">
                            <div>{{scope.row.created_at ? scope.row.created_at.substring(0, 16) : ''}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" v-if="hasPermission('admin/sitelist', 'update')">
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    type="primary"
                                    v-if="hasPermission('admin/sitelist', 'update')"
                                    @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page.sync="currentPage"
                        :page-size="perPage"
                        layout="total, prev, pager, next"
                        :total="total">
                </el-pagination>
                <div class="batch_delete" v-if="multipleSelection.length > 0 && hasPermission('admin/sitelist', 'delete')">
                    <el-button type="danger" @click="batchDelete">批量删除</el-button>
                </div>
            </div>

            <div class="updateWrapper" v-show="edit">
                <div class="title">请填写以下信息</div>
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm price" label-position="top" v-loading="loading">
                    <el-form-item label="网站名称" prop="name">
                        <el-input v-model="ruleForm.name" placeholder="请输入网站名称"></el-input>
                    </el-form-item>
                    <el-form-item label="网站别名" prop="alias">
                        <el-input v-model="ruleForm.alias" placeholder="请输入网站别名"></el-input>
                    </el-form-item>
                    <el-form-item label="网站URL" prop="url">
                        <el-input v-model="ruleForm.url" placeholder="请输入网站URL"></el-input>
                    </el-form-item>
                    <el-form-item label="扣费类型" prop="type">
                        <el-radio v-model="ruleForm.type" :label="'money'">次数</el-radio>
                        <el-radio v-model="ruleForm.type" :label="'point'">积分</el-radio>
                    </el-form-item>
                    <el-form-item label="状态是否可用" prop="isopen">
                        <el-switch
                                v-model="ruleForm.isopen"
                                active-color="#409eff"
                                inactive-color="#dcdfe6">
                        </el-switch>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
                        <el-button type="danger" @click="resetForm('ruleForm')">重置</el-button>
                        <el-button type="warning" @click="cancel()">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import { mapState } from 'vuex'
    import {
        Table,
        TableColumn,
        Pagination,
        Input,
        Button,
        Form,
        FormItem,
        Message,
        Loading,
        MessageBox,
        Switch
    } from 'element-ui'
    import PageTitle from '../frame/PageTitle.vue'
    import { checkToken }  from '../ajax';
    import { aesencode, aesdecode }  from '../utils';

    Vue.use(Table);
    Vue.use(TableColumn);
    Vue.use(Pagination);
    Vue.use(Input);
    Vue.use(Button);
    Vue.use(Form);
    Vue.use(FormItem);
    Vue.use(Loading);
    Vue.use(Switch);
    Vue.prototype.$confirm = MessageBox.confirm;
    Vue.prototype.$message = Message;

    export default {
        computed: {
            ...mapState(["domainUrl", 'baseURL']),
        },
        data(){
            return {
                currentPage: 1,
                perPage: 10,
                total: 1,
                searchkey: '',
                loading: false,
                edit: false,
                activeId: '',
                tableData: [],
                multipleSelection: [],
                ruleForm: {
                    name: '',
                    alias: '',
                    type: 'money',
                    url: '',
                    isopen: true
                },
                rules: {
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ],
                    url: [
                        { required: true, message: '请输入url', trigger: 'blur' }
                    ]
                }
            }
        },
        methods:{
            handleSizeChange(val) {
                console.log(`每页 ${val} 条`);
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.lists();
            },
            add(){
                this.edit = true;
                this.activeId = '';
                this.ruleForm.name = '';
                this.ruleForm.isopen = true;
            },
            submitForm(formName) {
                var that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        checkToken(function () {
                            that.loading = true;
                            that.axios.post('/setting/website', {
                                id: that.activeId,
                                name: that.ruleForm.name,
                                alias: that.ruleForm.alias,
                                url: that.ruleForm.url,
                                type: that.ruleForm.type,
                                isopen: that.ruleForm.isopen ? 1 : 0,
                                privilege: that.activeId ? encodeURIComponent(aesencode('update')) : encodeURIComponent(aesencode('add'))
                            })
                            .then(function (response) {
                                that.loading = false;
                                if(response.data.code == 0){
                                    Message.success({
                                        message: '操作成功'
                                    });

                                    that.ruleForm.name = '';
                                    that.ruleForm.alias = '';
                                    that.ruleForm.url = '';
                                    that.ruleForm.type = 'money';
                                    that.ruleForm.isopen = true;
                                    that.cancel();
                                    that.lists();
                                }
                                else{
                                    Message.warning({
                                        message: response.data.message
                                    });
                                }
                            })
                            .catch(function (error) {
                                that.loading = false;
                                Message.warning({
                                    message: '未知错误'
                                });
                            });
                        });
                    } else {
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            lists(){
                var that = this;
                checkToken(function () {
                    that.loading = true;
                    that.axios.get('/setting/sitepage', {
                        params: { //请求参数
                            page: that.currentPage,
                            num: that.perPage,
                            search: that.searchkey,
                            type: that.searchType,
                            brand: that.searchBrand,
                            privilege: encodeURIComponent(aesencode('read'))
                        }
                    })
                    .then(function (response) {
                        that.loading = false;
                        if (response.data.code == 0) {
                            that.tableData = response.data.data.data;
                            that.total = response.data.data.total;
                        }
                        else{
                            Message.warning({
                                message: response.data.message
                            });
                        }
                    })
                    .catch(function (error) {
                        Message.error({
                            message: '未知错误'
                        });
                        that.loading = false;
                    });
                });
            },
            cancel(){
                this.edit = false;
            },
            indexMethod(index){
                return index + 1;
            },
            search(){
                this.currentPage = 1;
                this.total = 1;
                this.tableData = [];
                this.lists()
            },
            handleEdit(index, row) {
                this.activeId = row.id;
                this.edit = true;
                this.ruleForm.name = row.name;
                this.ruleForm.alias = row.alias;
                this.ruleForm.url = row.url;
                this.ruleForm.type = row.type;
                this.ruleForm.isopen = row.isopen == 1 ? true : false;
            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            batchDelete(){
                var that = this;
                if(that.multipleSelection.length <= 0){
                    Message.warning({
                        message: '请选择要删除的选项'
                    });
                    return false;
                }

                that.$confirm('此操作将删除该信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    checkToken(function () {
                        that.loading = true;
                        let idstring = '';
                        for(let i=0; i<that.multipleSelection.length; i++){
                            if(idstring){
                                idstring += ',' + that.multipleSelection[i].id;
                            }
                            else{
                                idstring = that.multipleSelection[i].id;
                            }
                        }
                        that.axios.post('/setting/sitedelete', {
                            idstring: idstring,
                            privilege: encodeURIComponent(aesencode('delete'))
                        })
                        .then(function (response) {
                            that.loading = false;
                            if (response.data.code == 0) {
                                Message.success({
                                    message: '删除成功'
                                });

                                that.currentPage = 1;
                                that.total = 1;
                                that.tableData = [];
                                that.lists();
                            }
                            else{
                                Message.warning({
                                    message: response.data.message
                                });
                            }
                        })
                        .catch(function (error) {
                            that.loading = false;
                            Message.warning({
                                message: '删除失败'
                            });
                        });
                    });
                }).catch((error) => {

                });
            }
        },
        components: {
            PageTitle
        },
        mounted() {
            this.lists();
        }
    }
</script>
<style>
    .updateWrapper{
        background-color: white;
        border: 1px solid #ebeef5;
        padding: 20px;
    }
    .updateWrapper .title{
        background-color: #f6f8f8;
        font-size: 16px;
        margin: -20px -20px 10px -20px;
        padding: 15px 20px;
        color: #333;
        font-weight: bold;
    }
    .updateWrapper .el-form--label-top .el-form-item__label{
        padding: 0px;
    }
    .el-form-item__content .edui-toolbar{
        line-height: normal;
    }
    .status.active{
        color: green;
    }
    .status.unactive{
        color: red;
    }
    .price .el-form-item {
        margin-bottom: 15px;
    }
    .el-table td, .el-table th{
        text-align: center;
    }
</style>