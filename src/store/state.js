export default {
    loading: false,
    userInfo: sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')) : {name: '', desc: '', email: ''},
    token: sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : '',
    permissions: sessionStorage.getItem('permissions') ? JSON.parse(sessionStorage.getItem('permissions')) : [],
    ball: {
        left: 0,
        bottom: 0
    },
    sitename: 'VOC后台',
    baseURL: 'http://www.pf.com/api/',
    domainUrl: 'http://www.pf.com',
    collapse: false,
    activeIndex: sessionStorage.getItem('activeIndex') ? sessionStorage.getItem('activeIndex') : '/admin/user',
    //typeOptions: sessionStorage.getItem('typeOptions') ? JSON.parse(sessionStorage.getItem('typeOptions')) : [],
    //brandOptions: sessionStorage.getItem('brandOptions') ? JSON.parse(sessionStorage.getItem('brandOptions')) : [],
    timeOptions: [
        {
            value: 0,
            label: '不限制'
        }, {
            value: 1,
            label: '1天'
        }, {
            value: 7,
            label: '1周'
        }, {
            value: 30,
            label: '1月'
        }, {
            value: 365,
            label: '1年'
        }
    ]
}