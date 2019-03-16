<template>
    <div>
        <PageTitle title="套餐列表"></PageTitle>
        <div class="pageWrapper">
            <div class="lookWrapper" v-show="!edit">
                <div class="searchWrapper">
                    <el-input placeholder="请输入搜索内容" v-model="searchkey" size="medium">
                        <el-button slot="append" size="medium" icon="el-icon-search" @click="search"></el-button>
                    </el-input>
                    <el-button type="primary" size="medium" class="addBtn" icon="el-icon-plus" @click="add" v-if="hasPermission('admin/combolist', 'add')">添加</el-button>
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
                            label="套餐名称">
                    </el-table-column>
                    <el-table-column
                            prop="price"
                            width="100"
                            label="套餐价格">
                    </el-table-column>
                    <el-table-column
                            prop="timelong"
                            width="100"
                            label="套餐时长">
                        <template slot-scope="scope">
                            <div>{{scope.row.timelong == 0 ? '不限制' : scope.row.timelong == 1 ? '1天' : scope.row.timelong == 7 ? '7天' : scope.row.timelong == 30 ? '30天' : scope.row.timelong == 365 ? '1年' : ''}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="point"
                            width="120"
                            label="套餐积分">
                    </el-table-column>
                    <el-table-column
                            prop="type"
                            width="120"
                            label="套餐类型">
                        <template slot-scope="scope">
                            <div>{{scope.row.type == 'count' ? '按次计算' : '按天计算'}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="isopen"
                            width="70"
                            label="状态">
                        <template slot-scope="scope">
                            <div class="status" :class="scope.row.isopen == 1 ? 'active' : 'unactive'">{{scope.row.isopen == 1 ? '启用中' : '停用中'}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="created_at"
                            width="100"
                            label="创建时间">
                        <template slot-scope="scope">
                            <div>{{scope.row.created_at ? scope.row.created_at.substring(0, 10) : ''}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" v-if="hasPermission('admin/combolist', 'update')">
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    type="primary"
                                    v-if="hasPermission('admin/combolist', 'update')"
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
                <div class="batch_delete" v-if="multipleSelection.length > 0 && hasPermission('admin/combolist', 'delete')">
                    <el-button type="danger" @click="batchDelete">批量删除</el-button>
                </div>
            </div>

            <div class="updateWrapper" v-show="edit">
                <div class="title">请填写以下信息</div>
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm price" label-position="top" v-loading="loading">
                    <el-form-item label="套餐名称" prop="name">
                        <el-input v-model="ruleForm.name" placeholder="请输入套餐名称"></el-input>
                    </el-form-item>
                    <el-form-item label="套餐价格" prop="price">
                        <el-input v-model="ruleForm.price" placeholder="请输入套餐价格"></el-input>
                    </el-form-item>
                    <el-form-item label="套餐类型" prop="type">
                        <el-radio v-model="ruleForm.type" :label="'count'">按次计算</el-radio>
                        <el-radio v-model="ruleForm.type" :label="'day'">按天计算</el-radio>
                    </el-form-item>
                    <el-form-item label="套餐时长" prop="timelong">
                        <el-select v-model="ruleForm.timelong" placeholder="请选择" style="width: 100%;">
                            <el-option
                                    v-for="item in timeOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="套餐网站" prop="websites">
                        <el-checkbox-group v-model="selectedSites" @change="changeSite">
                            <el-checkbox :label="item.url" :name="item.url" v-for="(item, index) in websites">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="上限次数" prop="count" v-if="ruleForm.type=='count'">
                        <el-input v-model="ruleForm.count" placeholder="请输入上限次数"></el-input>
                    </el-form-item>
                    <el-form-item label="网站列表" prop="list" v-if="ruleForm.type=='day' && ruleForm.websites.length > 0">
                        <el-input placeholder="请输入次数" v-model="item.value" class="combo-input" v-for="(item, index) in ruleForm.websites">
                            <template slot="prepend">{{item.name}}</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="套餐积分" prop="point">
                        <el-input v-model="ruleForm.point" placeholder="请输入套餐积分"></el-input>
                    </el-form-item>
                    <el-form-item label="状态是否可用" prop="isopen">
                        <el-switch
                                v-model="ruleForm.isopen"
                                active-color="#409eff"
                                inactive-color="#dcdfe6">
                        </el-switch>
                    </el-form-item>
                    <el-form-item v-if="initSite">
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
        Checkbox,
        CheckboxGroup,
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
    Vue.use(Checkbox);
    Vue.use(CheckboxGroup);
    Vue.use(Switch);
    Vue.prototype.$confirm = MessageBox.confirm;
    Vue.prototype.$message = Message;

    export default {
        computed: {
            ...mapState(["domainUrl", 'baseURL', 'timeOptions']),
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
                websites: [],
                selectedSites: [],
                initSite: false,
                ruleForm: {
                    name: '',
                    price: '',
                    type: 'day',
                    timelong: 0,
                    point: 0,
                    count: 0,
                    websites: [],
                    isopen: true
                },
                rules: {
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ],
                    price: [
                        { required: true, message: '请输入价格', trigger: 'blur' }
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
                            that.axios.post('/setting/combo', {
                                id: that.activeId,
                                name: that.ruleForm.name,
                                price: that.ruleForm.price,
                                point: that.ruleForm.point,
                                timelong: that.ruleForm.timelong,
                                type: that.ruleForm.type,
                                count: that.ruleForm.count,
                                sites: that.ruleForm.websites,
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
                                    that.ruleForm.timelong = 0;
                                    that.ruleForm.point = 0;
                                    that.ruleForm.price = '';
                                    that.ruleForm.type = 'day';
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
                    that.axios.get('/setting/combopage', {
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
            sitelist(){
                var that = this;
                checkToken(function () {
                    that.loading = true;
                    that.axios.get('/setting/sitelist', {
                        params: { //请求参数
                            privilege: encodeURIComponent(aesencode('read'))
                        }
                    })
                    .then(function (response) {
                        that.loading = false;
                        if (response.data.code == 0) {
                            that.websites = response.data.data;
                            that.initSite = true;
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
                this.ruleForm.price = row.price;
                this.ruleForm.timelong = row.timelong;
                this.ruleForm.point = row.point;
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
                        that.axios.post('/setting/combodelete', {
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
            },
            changeSite(lists){
                if(lists.length > 0){
                    let sites = [];
                    for(let i=0; i<lists.length; i++){
                        for(let j=0; j<this.websites.length; j++){
                            if(lists[i] == this.websites[j].url){
                                sites.push(this.websites[j]);
                            }
                        }
                    }
                    this.ruleForm.websites = sites;
                }
                else{
                    this.ruleForm.websites = [];
                }
            }
        },
        components: {
            PageTitle
        },
        mounted() {
            this.lists();
            this.sitelist();
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
    .combo-input{
        width: 200px; margin-right: 15px; margin-top: 12px;
    }
</style>