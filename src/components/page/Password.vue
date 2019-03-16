<template>
    <div>
        <PageTitle title="卡密列表"></PageTitle>
        <div class="pageWrapper">
            <div class="lookWrapper" v-show="!edit">
                <div class="searchWrapper">
                    <el-input placeholder="请输入搜索内容" v-model="searchkey" size="medium">
                        <el-button slot="append" size="medium" icon="el-icon-search" @click="search"></el-button>
                    </el-input>
                    <el-button type="primary" size="medium" class="addBtn" icon="el-icon-plus" @click="add" v-if="hasPermission('admin/password', 'add')">通用套餐卡密</el-button>
                    <el-button type="success" size="medium" class="addBtn" icon="el-icon-plus" @click="addDiy" v-if="hasPermission('admin/password', 'add')" style="margin-right: 15px;">自定义套餐卡密</el-button>
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
                            prop="agentname"
                            label="所属代理">
                    </el-table-column>
                    <el-table-column
                            prop="comboname"
                            label="套餐名称">
                    </el-table-column>
                    <el-table-column
                            prop="password"
                            label="卡密">
                    </el-table-column>
                    <el-table-column
                            prop="point"
                            width="120"
                            label="开始时间">
                    </el-table-column>
                    <el-table-column
                            prop="point"
                            width="120"
                            label="结束时间">
                    </el-table-column>
                    <el-table-column
                            prop="mobile"
                            width="120"
                            label="手机号码">
                    </el-table-column>
                    <el-table-column
                            prop="isopen"
                            width="80"
                            label="是否开启">
                        <template slot-scope="scope">
                            <div class="status" :class="scope.row.isopen == 1 ? 'active' : 'unactive'">{{scope.row.isopen == 1 ? '启用中' : '停用中'}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="status"
                            width="70"
                            label="状态">
                        <template slot-scope="scope">
                            <div class="status" :class="scope.row.status == 1 ? 'active' : 'unactive'">{{scope.row.status == 1 ? '已激活' : '未激活'}}</div>
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
                    <el-table-column
                            prop="updated_at"
                            width="100"
                            label="激活时间">
                        <template slot-scope="scope">
                            <div>{{scope.row.updated_at ? scope.row.updated_at.substring(0, 10) : ''}}</div>
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
                <div class="batch_delete" v-if="multipleSelection.length > 0 && hasPermission('admin/password', 'delete')">
                    <el-button type="danger" @click="batchDelete">批量冻结</el-button>
                </div>
            </div>

            <div class="updateWrapper" v-show="edit">
                <div class="title">请填写以下信息</div>
                <el-form :model="ruleForm" v-if="diy" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm price" label-position="top" v-loading="loading">
                    <el-form-item label="所属代理" prop="uid">
                        <el-select filterable v-model="ruleForm.uid" placeholder="代理商" size="medium" style="width: 100%;">
                            <el-option
                                    v-if="item.id != 2"
                                    v-for="item in agents"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="卡密价格" prop="price">
                        <el-input v-model="ruleForm.price" placeholder="请输入卡密价格" size="medium" ></el-input>
                    </el-form-item>
                    <el-form-item label="卡密类型" prop="type">
                        <el-radio v-model="ruleForm.type" :label="'count'">按次计算</el-radio>
                        <el-radio v-model="ruleForm.type" :label="'day'">按天计算</el-radio>
                    </el-form-item>
                    <el-form-item label="卡密时长" prop="timelong">
                        <el-select v-model="ruleForm.timelong" placeholder="请选择" size="medium"  style="width: 100%;">
                            <el-option
                                    v-for="item in timeOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="卡密网站" prop="websites">
                        <el-checkbox-group v-model="selectedSites" @change="changeSite">
                            <el-checkbox :label="item.url" :name="item.url" v-for="(item, index) in websites">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="上限次数" prop="count" v-if="ruleForm.type=='count'">
                        <el-input v-model="ruleForm.count" placeholder="请输入上限次数" size="medium" ></el-input>
                    </el-form-item>
                    <el-form-item label="网站列表" prop="list" v-if="ruleForm.type=='day' && ruleForm.websites.length > 0">
                        <el-input placeholder="请输入次数" v-model="item.value" size="medium"  class="combo-input" v-for="(item, index) in ruleForm.websites">
                            <template slot="prepend">{{item.name}}</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="卡密积分" prop="point">
                        <el-input v-model="ruleForm.point" placeholder="请输入卡密积分" size="medium" ></el-input>
                    </el-form-item>
                    <el-form-item label="卡密数量" prop="num">
                        <el-input v-model="ruleForm.num" placeholder="请输入卡密数量" size="medium" ></el-input>
                    </el-form-item>
                    <br/>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
                        <el-button type="warning" @click="cancel()">取消</el-button>
                    </el-form-item>
                </el-form>

                <el-form :model="ruleFormCombo" v-if="!diy" :rules="rulesCombo" ref="ruleFormCombo" label-width="100px" class="demo-ruleForm price" label-position="top" v-loading="loading">
                    <el-form-item label="所属套餐" prop="combo_id" v-if="initCombo">
                        <el-select filterable v-model="ruleFormCombo.combo_id" placeholder="套餐" size="medium" style="width: 100%;">
                            <el-option
                                    v-for="item in combolist"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="卡密数量" prop="num">
                        <el-input v-model="ruleFormCombo.num" placeholder="请输入卡密数量" size="medium" ></el-input>
                    </el-form-item>
                    <br/>
                    <el-form-item v-if="initCombo">
                        <el-button type="primary" @click="submitFormCombo('ruleFormCombo')">提交</el-button>
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
        Select,
        Option,
        Message,
        Loading,
        MessageBox,
        Switch,
        Dialog
    } from 'element-ui'
    import PageTitle from '../frame/PageTitle.vue'
    import { checkToken }  from '../ajax';
    import { aesencode, aesdecode }  from '../utils';

    Vue.use(Table);
    Vue.use(TableColumn);
    Vue.use(Pagination);
    Vue.use(Input);
    Vue.use(Button);
    Vue.use(Select);
    Vue.use(Option);
    Vue.use(Form);
    Vue.use(FormItem);
    Vue.use(Loading);
    Vue.use(Switch);
    Vue.use(Dialog);
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
                diy: false,
                activeId: '',
                tableData: [],
                multipleSelection: [],
                dialogVisible: false,
                websites: [],
                selectedSites: [],
                initSite: false,
                agents: [],
                initAgent: false,
                combolist: [],
                initCombo: false,
                ruleForm: {
                    uid: '',
                    price: '',
                    type: 'day',
                    timelong: 0,
                    point: 0,
                    count: 0,
                    num: 1,
                    websites: [],
                    isopen: true
                },
                rules: {
                    price: [
                        { required: true, message: '请输入卡密价格', trigger: 'blur' }
                    ],
                    num: [
                        { required: true, message: '请输入卡密数量', trigger: 'blur' }
                    ]
                },
                ruleFormCombo: {
                    combo_id: '',
                    num: 1
                },
                rulesCombo: {
                    num: [
                        { required: true, message: '请输入卡密数量', trigger: 'blur' }
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
                this.diy = false;
            },
            addDiy(){
                this.edit = true;
                this.diy = true;
                this.ruleForm.isopen = true;
            },
            submitForm(formName) {
                var that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        checkToken(function () {
                            that.loading = true;
                            that.axios.post('/setting/pwddiy', {
                                uid: that.ruleForm.uid,
                                num: that.ruleForm.num,
                                price: that.ruleForm.price,
                                point: that.ruleForm.point,
                                timelong: that.ruleForm.timelong,
                                type: that.ruleForm.type,
                                count: that.ruleForm.count,
                                sites: that.ruleForm.websites,
                                isopen: that.ruleForm.isopen ? 1 : 0,
                                privilege: encodeURIComponent(aesencode('add'))
                            })
                            .then(function (response) {
                                that.loading = false;
                                if(response.data.code == 0){
                                    Message.success({
                                        message: '操作成功'
                                    });
                                    that.ruleForm.num = '';
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
            submitFormCombo(formName) {
                var that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        checkToken(function () {
                            that.loading = true;
                            that.axios.post('/setting/generatepwd', {
                                combo_id: that.ruleFormCombo.combo_id,
                                num: that.ruleFormCombo.num,
                                privilege: encodeURIComponent(aesencode('add'))
                            })
                            .then(function (response) {
                                that.loading = false;
                                if(response.data.code == 0){
                                    Message.success({
                                        message: '操作成功'
                                    });
                                    that.ruleFormCombo.num = '';
                                    that.ruleFormCombo.combo_id = '';
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
                    that.axios.get('/setting/pwdlist', {
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
            agentlist(){
                var that = this;
                checkToken(function () {
                    that.loading = true;
                    that.axios.get('/admins/agents', {
                        params: { //请求参数
                            privilege: encodeURIComponent(aesencode('read'))
                        }
                    })
                    .then(function (response) {
                        that.loading = false;
                        if (response.data.code == 0) {
                            that.agents = response.data.data;
                            that.initAgent = true;
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
            combolists(){
                var that = this;
                checkToken(function () {
                    that.loading = true;
                    that.axios.get('/setting/combolist', {
                        params: { //请求参数
                            privilege: encodeURIComponent(aesencode('read'))
                        }
                    })
                    .then(function (response) {
                        that.loading = false;
                        if (response.data.code == 0) {
                            that.combolist = response.data.data;
                            that.initCombo = true;
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
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            batchDelete(){
                var that = this;
                if(that.multipleSelection.length <= 0){
                    Message.warning({
                        message: '请选择要冻结的选项'
                    });
                    return false;
                }

                that.$confirm('此操作将冻结该信息, 是否继续?', '提示', {
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
                        that.axios.post('/setting/pwdfreeze', {
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
            this.agentlist();
            this.combolists();
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