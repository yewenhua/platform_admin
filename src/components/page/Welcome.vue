<template>
    <div>
        <PageTitle title="消费统计"></PageTitle>
        <div class="pageWrapper" v-loading="loading">
            <div class="lookWrapper" v-if="1==2">
                <div class="searchWrapper">

                </div>
            </div>
            <ul class="wel-gragh">
                <li>
                    <h-chart :id="idFirst" :option="optionColumn"></h-chart>
                </li>
                <li>
                    <h-chart :id="idPie" :option="optionPie"></h-chart>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import { mapState } from 'vuex'
    import HChart from '../Chart/HChart.vue';
    import PageTitle from '../frame/PageTitle.vue'
    import {
        Button,
        Input,
        Message,
        Loading,
        MessageBox,
        Select,
        Option,
        DatePicker
    } from 'element-ui'
    import { checkToken }  from '../ajax';
    import { aesencode, aesdecode }  from '../utils';

    Vue.use(Button);
    Vue.use(Input);
    Vue.use(Loading);
    Vue.use(Select);
    Vue.use(Option);
    Vue.use(DatePicker);
    Vue.prototype.$confirm = MessageBox.confirm;
    Vue.prototype.$message = Message;

    export default {
        computed: {
            ...mapState(["domainUrl", 'baseURL', 'typeOptions', 'brandOptions']),
        },
        data() {
            let optionColumn = {
                chart: {
                    type: 'column'
                },
                title: {
                    text: '过去七天消费量趋势',
                },
                xAxis: {
                    categories: [
                        '一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'
                    ],
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: '消费量 (元)'
                    }
                },
                legend: {
                    align: 'center',
                    x: 30,
                    verticalAlign: 'top',
                    y: 25,
                    floating: true,
                    backgroundColor: 'white',
                    shadow: false
                },
                tooltip: {
                    formatter: function () {
                        return this.x + '<br/>消费总金额：' + this.y + '元';
                    }
                },
                plotOptions: {
                    column: {
                        borderWidth: 0
                    }
                },
                series: [
                    {
                        name: '东京',
                        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
                    }, {
                        name: '纽约',
                        data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]
                    }, {
                        name: '伦敦',
                        data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]
                    }
                ],
                credits: {
                    enabled: false     //不显示LOGO
                }
            };
            let optionPie = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: '2018年1月浏览器市场份额'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: 'black'
                            }
                        }
                    }
                },
                series: [{
                    name: 'Brands',
                    colorByPoint: true,
                    data: [{
                        name: 'Chrome',
                        y: 61.41,
                        sliced: true,
                        selected: true
                    }, {
                        name: 'Internet Explorer',
                        y: 11.84
                    }, {
                        name: 'Firefox',
                        y: 10.85
                    }, {
                        name: 'Edge',
                        y: 4.67
                    }, {
                        name: 'Safari',
                        y: 4.18
                    }, {
                        name: 'Sogou Explorer',
                        y: 1.64
                    }, {
                        name: 'Opera',
                        y: 1.6
                    }, {
                        name: 'QQ',
                        y: 1.2
                    }, {
                        name: 'Other',
                        y: 2.61
                    }]
                }]
            };

            return {
                hasData: false,
                idFirst: 'first',
                idPie: 'second',
                optionColumn: optionColumn,
                optionPie: optionPie,
                searchkey: '',
                searchUid: 'all',
                searchType: 'all',
                searchBrand: 'all',
                loading: false,
                statistic: [],
                agents: [],
                usertype: 'agent'
            }
        },
        methods:{
            getStatistic(){
                var that = this;
                checkToken(function () {
                    that.loading = true;
                    that.hasData = false;
                    that.axios.get('/cash/statistic', {
                        params: { //请求参数
                            uid: that.searchUid,
                            search: that.searchkey,
                            privilege: encodeURIComponent(aesencode('read'))
                        }
                    })
                    .then(function (response) {
                        that.loading = false;
                        if (response.data.code == 0) {
                            that.hasData = true;
                            that.statistic = response.data.data;
                            let categories = [];
                            let data = [];
                            for(let key in that.statistic){
                                categories.push(key);
                                data.push(that.statistic[key]);
                            }
                            that.optionColumn.xAxis.categories = categories;
                            that.optionColumn.series[0].data = data;
                        }
                    })
                    .catch(function (error) {
                        Message.error({
                            message: '未知错误'
                        });
                        that.loading = false;
                        that.hasData = false;
                    });
                });
            },
            search(){
                this.getStatistic();
            },
            chgType(){
                this.getStatistic();
            },
            chgBrand(){
                this.getStatistic();
            },
            chgUid(){
                this.getStatistic();
            },
            getAgents(){
                var that = this;
                checkToken(function () {
                    that.loading = true;
                    that.axios.get('/admins/lists', {
                        params: { //请求参数
                            privilege: encodeURIComponent(aesencode('read'))
                        }
                    })
                    .then(function (response) {
                        that.loading = false;
                        if (response.data.code == 0) {
                            that.agents = response.data.data.list;
                            that.usertype = response.data.data.type;
                            if(that.usertype == 'agent'){
                                that.agents[0].name = '我运营的设备';
                                that.searchUid = that.agents[0].id;
                            }
                            that.getStatistic();
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
        },
        components: {
            HChart,
            PageTitle
        },
        mounted() {

        }
    }
</script>
<style>
    .wel-gragh{
        list-style: none;
        margin: 0;
        padding:0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
    .wel-gragh li{
        width: 100%;
        box-sizing: border-box;
        height: 415px;
        overflow: auto;
        -webkit-overflow-scrolling : touch;
        margin-bottom: 15px;
        padding-top: 15px;
        background: white;
    }
    .wel-gragh li:nth-child(odd){
        padding-right: 8px;
    }
    .wel-gragh li:nth-child(even){
        padding-left: 8px;
    }
    #first, #second{
        height: 400px;
    }
    @media (min-width: 1500px){
        .wel-gragh li{
            height: 515px;
        }
        #first, #second{
            height: 500px;
        }
    }

</style>