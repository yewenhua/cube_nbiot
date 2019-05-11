export default {
    loading: false,
    userInfo: sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')) : {name: '', desc: '', email: ''},
    token: sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')) : '',
    permissions: sessionStorage.getItem('permissions') ? JSON.parse(sessionStorage.getItem('permissions')) : [],
    ball: {
        left: 0,
        bottom: 0
    },
    sitename: '威欧希科技',
    baseURL: 'http://iot.voc.so',
    domainUrl: '',
    wechat: sessionStorage.getItem('wechat') ? JSON.parse(sessionStorage.getItem('wechat')) : null,
    subCode: sessionStorage.getItem('subCode') ? sessionStorage.getItem('subCode') : '',
    collapse: false,
    activeIndex: sessionStorage.getItem('activeIndex') ? sessionStorage.getItem('activeIndex') : '/admin/user',
    typeOptions: sessionStorage.getItem('typeOptions') ? JSON.parse(sessionStorage.getItem('typeOptions')) : [],
    brandOptions: sessionStorage.getItem('brandOptions') ? JSON.parse(sessionStorage.getItem('brandOptions')) : []
}