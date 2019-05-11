<template>
    <div class="center-page">
        <div class="header-wrapper">
            <div class="header">
                <div class="left">
                    <img :src="data ? data.headIcon : header_img"/>
                </div>
                <div class="right">
                    <div class="name">{{data ? data.name : ''}}（{{data ? data.account : ''}}）</div>
                    <div class="address">锁有不凡，源于坚持</div>
                </div>
            </div>
            <div class="menu-list" v-if="1==2">
                <ul>
                    <li>
                        <div class="num">1</div>
                        <div class="title">设备数量</div>
                    </li>
                    <li>
                        <div class="num">8</div>
                        <div class="title">指纹数量</div>
                    </li>
                    <li>
                        <div class="num">10</div>
                        <div class="title">未读消息</div>
                    </li>
                </ul>
            </div>
        </div>

        <div class="home-content">
            <ul>
                <li>
                    <router-link :to="{ name:'devicelist'}">
                        <div class="img">
                            <img :src="require('../assets/img/device.svg')"/>
                        </div>
                        <div class="title">设备管理</div>
                    </router-link>
                </li>
                <li>
                    <router-link :to="{ name:'fingurelist'}">
                        <div class="img">
                            <img :src="require('../assets/img/pointer.svg')"/>
                        </div>
                        <div class="title">指纹管理</div>
                    </router-link>
                </li>
                <li>
                    <router-link :to="{ name:'lockrecord'}">
                        <div class="img">
                            <img :src="require('../assets/img/lock.svg')"/>
                        </div>
                        <div class="title">开锁日志</div>
                    </router-link>
                </li>
                <li>
                    <router-link :to="{ name:'alertrecord'}">
                        <div class="img">
                            <img :src="require('../assets/img/alert.svg')"/>
                            <span class="num" v-if="statistic && statistic.alarmUnreadCount > 0">{{statistic ? statistic.alarmUnreadCount : ''}}</span>
                        </div>
                        <div class="title">报警通知</div>
                    </router-link>
                </li>
                <li>
                    <router-link :to="{ name:'editpwd'}">
                        <div class="img">
                            <img :src="require('../assets/img/safe.svg')"/>
                        </div>
                        <div class="title">安全设置</div>
                    </router-link>
                </li>
                <li @click="unbind">
                    <div class="img">
                        <img :src="require('../assets/img/service.svg')"/>
                    </div>
                    <div class="title">微信解绑</div>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import {
        Loading,
        Slide,
        Button,
        Dialog,
        Toast,
        Style,
        ActionSheet
    } from 'cube-ui';
    import { mapState } from 'vuex';
    import { checkToken }  from '../utils/ajax';

    Vue.use(Loading);
    Vue.use(Slide);
    Vue.use(Button);
    Vue.use(Toast);
    Vue.use(Dialog);
    Vue.use(Style);
    Vue.use(ActionSheet);

    export default {
        computed: {
            ...mapState([
                'subCode',
                'wechat',
                'baseURL'
            ])
        },
        data () {
            return {
                data: null,
                loading: false,
                statistic: null,
                header_img: require('../assets/img/sns_icon_8.png'),
                toast: null,
            }
        },
        methods:{
            showToastLoading (msg) {
                this.toast = this.$createToast({
                    txt: msg || '加载中...',
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
                    time: 1000,
                    txt: msg
                }).show();
            },

            getShareDevice(cb){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading('设备领取中...');
                        this.loading = true;
                        let url = '/v1/deviceShareApply/share/' + this.subCode;
                        this.axios({
                            method: 'get',
                            url: url,
                            params: {},
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            this.$store.dispatch('subcribe', {
                                subCode: ''
                            });
                            if (response.status == 200 && response.data.type == 'SUCCESS') {
                                this.showToastMsg('correct', '设备订阅成功');

                                setTimeout(()=>{
                                    this.$router.push({
                                        path: '/app/devicelist'
                                    });
                                }, 1500);
                            }
                            else {
                                this.showToastMsg('warn', response.data.content);
                            }
                            cb();
                        }.bind(this)).catch(function (error) {
                            this.hideToastLoading();
                            this.loading = false;
                            this.showToastMsg('warn', '设备订阅失败');
                            cb();
                        }.bind(this));
                    }.bind(this));
                }
            },
            getData(cb){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading();
                        this.loading = true;
                        this.axios({
                            method: 'get',
                            url: '/v1/user/self',
                            params: {},
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.type == 'SUCCESS') {
                                this.data = response.data.data;
                            }
                            else {
                                this.showToastMsg('warn', response.data.content);
                            }
                            cb();
                        }.bind(this)).catch(function (error) {
                            this.hideToastLoading();
                            this.loading = false;
                            this.showToastMsg('warn', '获取失败');
                            cb();
                        }.bind(this));
                    }.bind(this));
                }
            },
            getStatistic(){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading();
                        this.loading = true;
                        this.axios({
                            method: 'post',
                            url: '/v1/indexStatic/get',
                            data: {},
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.type == 'SUCCESS') {
                                this.statistic = response.data.data;
                            }
                            else {
                                this.showToastMsg('warn', response.data.content);
                            }
                        }.bind(this)).catch(function (error) {
                            this.hideToastLoading();
                            this.loading = false;
                            this.showToastMsg('warn', '获取失败');
                        }.bind(this));
                    }.bind(this));
                }
            },
            unbind(){
                this.$createActionSheet({
                    title: '确认要解除绑定微信吗',
                    active: 0,
                    data: [
                        {content: '解除绑定微信'}
                    ],
                    onSelect: () => {
                        if(!this.loading) {
                            checkToken(function () {
                                this.showToastLoading('提交中...');
                                this.loading = true;
                                let url = '/v1/weixin/openidUnBind';
                                this.axios({
                                    method: 'get',
                                    url: url,
                                    params: {},
                                }).then(function (response) {
                                    this.hideToastLoading();
                                    this.loading = false;
                                    if (response.status == 200 && response.data.type == 'SUCCESS') {
                                        this.showToastMsg('correct', '解绑成功');
                                        this.$store.dispatch('logout');
                                        this.$store.dispatch('wechat', {
                                            code: '',
                                            bind: 0
                                        });
                                        setTimeout(()=>{
                                            location.href = this.baseURL;
                                        }, 1200)
                                    }
                                    else {
                                        this.showToastMsg('warn', response.data.content);
                                    }
                                }.bind(this)).catch(function (error) {
                                    this.hideToastLoading();
                                    this.loading = false;
                                    this.showToastMsg('warn', '未知错误');
                                }.bind(this));
                            }.bind(this));
                        }
                    }
                }).show();
            }
        },
        mounted(){
            let that = this;
            document.title = 'VOC指纹锁';

            if(that.subCode){
                that.getShareDevice(()=>{
                    that.getData(()=>{
                        that.getStatistic();
                    });
                });
            }
            else{
                that.getData(()=>{
                    that.getStatistic();
                });
            }
        }
    }
</script>
<style scoped="scoped">
    .center-page{
        position: relative;
        background-color: #f0eff4;
    }
    .header-wrapper {
        height: 1.5rem;
        width: 100%;
        display: flex;
        flex-direction: column;
        background: url('../assets/img/head.png');
        background-size: 100% 100%;
    }
    .header{
        height: 1.5rem;
        width: 100%;
        display: flex;
        flex-direction: row;
        padding-left: 0.15rem;
        padding-right: 0.15rem;
        box-sizing: border-box;
        align-items: center;
    }
    .header .left{
        width: 0.6rem;
        height: 0.6rem;
        box-sizing: border-box;
    }
    .header .right{
        box-sizing: border-box;
        padding-left: 0.25rem;
        width: calc( 100% - 0.6rem);
    }
    .header .left img{
        height: 100%;
        width: 100%;
        border-radius: 50%;
        border: 0.02rem solid white;
        display: block;
    }
    .header .right .name{
        font-family: PingFangSC-Regular;
        font-size: 0.18rem;
        color: #FFFFFF;
        margin-bottom: 0.08rem;
    }
    .header .right .address{
        font-family: PingFangSC-Regular;
        font-size: 0.14rem;
        color: rgba(255,255,255,0.80);
    }
    .menu-list{
        width: 100%;
    }
    .menu-list ul {
        width: 100%;
        list-style: none;
        margin: 0;
        padding: 0;
        padding-left: 0.1rem;
        padding-right: 0.1rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
    }
    .menu-list li{
        width: 33.3%;
    }
    .menu-list li .num{
        font-size: 0.2rem;
        height: 0.2rem;
        line-height: 0.2rem;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: center;
    }
    .menu-list li .title{
        font-size: 0.12rem;
        color: #EEEEEE;
        height: 0.2rem;
        line-height: 0.2rem;
        text-align: center;
    }

    .home-content{
        background: #fff;
        margin-top: 0.12rem;
        padding-left: 0.15rem;
        padding-right: 0.15rem;
        font-family: PingFangSC-Regular;
        font-size: 0.12rem;
        box-sizing: border-box;
        padding-top: 0.12rem;
        padding-bottom: 0.24rem;
        color: #A7873E;
        position: relative;
    }
    .home-content:after{
        content: '';
        background-color: rgba(220,220,220,0.50);
        box-shadow: inset 0 -0.01rem 0 0 rgba(206,206,206,0.50);
        height: 0.01rem;
        transform: scaleY(0.5);
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
    }
    .home-content ul{
        list-style: none;
        margin: 0;
        padding: 0;
        padding-left: 0.1rem;
        padding-right: 0.1rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 100%;
    }
    .home-content li{
        height: 0.68rem;
        width: 33.3%;
        padding-top: 0.1rem;
        padding-bottom: 0.1rem;
    }
    .home-content li .img{
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    .home-content li .num{
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        margin-left: 0.15rem;
        top: -0.05rem;
        background: red;
        color: white;
        font-size: 0.12rem;
        border-radius: 0.1rem;
        font-weight: bold;
        padding: 0.03rem 0.04rem;
    }
    .home-content li .img img{
        width: 0.3rem;
        height: 0.3rem;
        display: block;
    }
    .home-content li .title{
        text-align: center;
        height: 0.38rem;
        line-height: 0.38rem;
        font-size: 0.13rem;
        color: #3F3F3F;
    }

</style>