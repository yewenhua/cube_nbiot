<template>
    <div class="wechat-page" v-if="show">
        <div class="b-tip">
            <img :src="logo_img"/>
        </div>
        <div class="w-content">
            <cube-input v-model="mobile" class="bind-input" type="number" placeholder="请输入手机号码"></cube-input>
            <cube-input v-model="password" type="password" class="bind-input" placeholder="请输入密码"></cube-input>
        </div>
        <div class="bind">
            <cube-button :primary="true" @click="login">登录账号</cube-button>
        </div>
        <div class="goto">
            <div class="left">
                <router-link :to="{ name:'signup'}">注册账号</router-link>
            </div>
            <div class="right">
                <router-link :to="{ name:'forget'}">忘记密码</router-link>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import {
        Loading,
        Button,
        Toast,
        Style
    } from 'cube-ui';
    import { checkSigninPage }  from '../../utils/ajax';
    import { mapState } from 'vuex';

    Vue.use(Loading);
    Vue.use(Button);
    Vue.use(Toast);
    Vue.use(Style);

    export default {
        computed: {
            ...mapState([
                'wechat',
                'token'
            ])
        },
        data () {
            return {
                logo_img: require('../../assets/img/logo.svg'),
                password: '',
                mobile: '',
                code: '',
                loading: false,
                toast: null,
                openid: '',
                show: false
            }
        },
        methods:{
            showToastLoading (msg) {
                this.toast = this.$createToast({
                    txt: msg,
                    mask: true
                })
                this.toast.show();
            },
            hideToastLoading (){
                this.toast.hide();
            },
            showToastMsg(type, msg){
                this.$createToast({
                    type: type,
                    time: 1500,
                    txt: msg
                }).show();
            },
            login(){
                if(!this.mobile){
                    this.showToastMsg('warn', '手机号码不能为空');
                    return false;
                }
                if(!this.password){
                    this.showToastMsg('warn', '密码不能为空');
                    return false;
                }

                if(!this.loading) {
                    this.loading = true;
                    this.showToastLoading('微信绑定中...');
                    //let url = 'oauth/token?client_id=e41df05b-f963-4a66-a8cd-8596d1564fee&client_secret=3ca4b24f-d2cd-44cc-b5c9-31f88c7c5631&grant_type=password&scope=read,write&username=' + this.mobile + '&password=' + this.password;
                    let url = '/global/login';
                    this.axios({
                        method: 'post',
                        url: url,
                        data: {
                            username: this.mobile,
                            password: this.password,
                            openid: this.openid ? this.openid : (this.token && this.token.access_token) ? this.token.access_token : ''
                        },
                        //headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    }).then(function (response) {
                        this.loading = false;
                        this.hideToastLoading();
                        if (response.status == 200 && response.data.type == 'SUCCESS') {
                            this.showToastMsg('correct', '微信绑定成功');
                            //this.$store.dispatch('login', {
                                //access_token: response.data.data.access_token,
                                //refresh_token: response.data.data.refresh_token
                            //});

                            let info = this.wechat;
                            this.$store.dispatch('wechat', {
                                code: info ? info.code : '',
                                bind: 1
                            });

                            let redirect = decodeURIComponent(this.$route.query.redirect || '/');
                            this.$router.push({
                                path: redirect,
                                replace: true
                            });
                        }
                        else {
                            this.showToastMsg('warn', response.data.content);
                        }
                    }.bind(this)).catch(function (error) {
                        this.loading = false;
                        this.hideToastLoading();
                        this.showToastMsg('warn', error.content || '未知错误');
                    }.bind(this));
                }
            },
            outhurl(){
                if(!this.loading) {
                    this.loading = true;
                    //this.showToastLoading('加载中...');
                    this.axios({
                        method: 'get',
                        url: '/global/weixin/util/getCodeUrl',
                        params: {

                        }
                    }).then(function (response) {
                        this.loading = false;
                        //this.hideToastLoading();
                        if (response.status == 200 && response.data.type == 'SUCCESS') {
                            window.location.replace(response.data.data);
                        }
                        else {
                            this.show = true;
                            this.showToastMsg('warn', response.data.content);
                        }
                    }.bind(this)).catch(function (error) {
                        this.loading = false;
                        this.show = true;
                        //this.hideToastLoading();
                        this.showToastMsg('warn', '未知错误');
                    }.bind(this));
                }
            },
            outhinfo(cb){
                if(!this.loading) {
                    this.loading = true;
                    //this.showToastLoading('加载中...');
                    this.axios({
                        method: 'get',
                        url: '/global/weixin/util/getOpenid',
                        params: {
                            code: this.code
                        }
                    }).then(function (response) {
                        this.loading = false;
                        //this.hideToastLoading();
                        if (response.status == 200 && response.data.type == 'SUCCESS') {
                            this.openid = response.data.data.openid;
                            this.$store.dispatch('wechat', {
                                code: this.code,
                                bind: response.data.data.hasBind
                            });
                            this.$store.dispatch('login', {
                                access_token: response.data.data.openid,
                                refresh_token: ''
                            });

                            //未绑定时提交登录绑定
                            if(response.data.data.hasBind == 1){
                                //已绑定时直接跳转
                                cb();
                            }
                            else{
                                //未绑定提交绑定
                                this.show = true;
                            }
                        }
                        else {
                            this.show = true;
                            this.showToastMsg('warn', response.data.content);
                            cb();
                        }
                    }.bind(this)).catch(function (error) {
                        this.loading = false;
                        //this.hideToastLoading();
                        this.show = true;
                        this.showToastMsg('warn', '未知错误');
                        cb();
                    }.bind(this));
                }
            },
            getUrlKey(name) {
                return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20')) || null;
            }
        },
        mounted(){
            document.title = 'VOC指纹锁';
            let key = this.getUrlKey('key');
            if(key){
                this.$store.dispatch('subcribe', {
                    subCode: key
                });
            }

            let code = this.getUrlKey('code');
            //outh2  先走完授权流程在执行其他逻辑
            if((this.wechat && !this.wechat.code) || !this.wechat) {
                if (code) {
                    this.code = code;
                    this.outhinfo(() => {
                        checkSigninPage(() => {
                            this.$router.push({
                                path: '/',
                                replace: true
                            });
                        });
                    });
                }
                else {
                    this.outhurl();
                }
            }
            else{
                if(this.wechat && this.wechat.bind == 1){
                    this.show = false;
                    checkSigninPage(() => {
                        this.$router.push({
                            path: '/',
                            replace: true
                        });
                    });
                }
                else{
                    this.show = true;
                }
            }
        }
    }
</script>
<style scoped="scoped">
    .wechat-page{
        box-sizing: border-box;
        padding: 0.15rem;
        background-color: #fff;
        overflow: hidden;
    }
    .b-tip{
        font-family: PingFangSC-Regular;
        font-size: 0.12rem;
        color: #888888;
        margin-bottom: 0.08rem;
        text-align: center;
        display: flex;
        justify-content: center;
        padding-top: 0.3rem;
        padding-bottom: 0.3rem;
    }
    .b-tip img{
        height: 1.5rem;
        display: block;
        position: relative;
        top: -0.45rem;
    }
    .w-content .cube-input::after{
        border: none;
        box-shadow: inset 0 -0.01rem 0 0 rgba(220,220,220,0.50);
    }
    .w-content .cube-input{
        margin-bottom: 0.2rem;
    }
    .bind{
        margin-top: 0.4rem;
    }
    .bind .cube-btn{
        width: 100%;
        height: 0.45rem;
        line-height: 0.45rem;
        padding: 0;
        font-size:  0.16rem;
    }
    .bind .cube-btn-primary {
        background: #00436E;
        box-shadow: 0 0.05rem 0.08rem 0 rgba(0,0,0,0.05);
        border-radius: 0.04rem;
    }
    .bind:active .cube-btn-primary {
        background: #095383;
    }
    .goto{
        display: flex;
        flex-direction: row;
        height: 0.4rem;
        margin-top: 0.15rem;
    }
    .goto .left{
        width: 50%;
        position: relative;
        height: 100%;
    }
    .goto .right{
        width: 50%;
        height: 100%;
    }
    .goto .left:after{
        content: '';
        background-color: rgba(220,220,220,0.50);
        height: 100%;
        transform: scaleX(0.5);
        transform: scaleY(0.5);
        width: 0.01rem;
        position: absolute;
        right: 0;
        top: 0;
    }
    .goto a{
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.14rem;
        color: #555555;
    }
</style>