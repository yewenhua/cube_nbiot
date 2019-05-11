<template>
    <div class="center-page">
        <div class="header-wrapper">
            <div class="header">
                <div class="left">
                    <img :src="data ? data.headIcon : header_img"/>
                </div>
                <div class="right">
                    <div class="name">{{data ? data.name : ''}}</div>
                    <div class="address">{{data ? data.account : '锁有不凡，源于坚持'}}</div>
                </div>
            </div>
            <div class="menu">
                <div class="item">
                    <router-link :to="{ name:'binddevice'}">
                        <img :src="require('../assets/img/add.svg')"/>
                        <div class="add">添加设备</div>
                    </router-link>
                </div>
                <div class="item">
                    <router-link :to="{ name:'devicelist'}">
                        <img :src="require('../assets/img/device2.svg')"/>
                        <div class="add">我的设备</div>
                    </router-link>
                </div>
                <div class="item">
                    <router-link :to="{ name:'fingurelist'}">
                        <img :src="require('../assets/img/finger.svg')"/>
                        <div class="add">设备用户</div>
                    </router-link>
                </div>
            </div>
        </div>
        <div class="inner-content m-t">
            <ul>
                <li>
                    <router-link :to="{ name:'lockrecord'}">
                        <div class="left">
                            <img :src="require('../assets/img/lock2.svg')"/>
                        </div>
                        <div class="middle">
                            <div class="item">开锁日志</div>
                        </div>
                        <div class="right"></div>
                    </router-link>
                </li>
                <li>
                    <router-link :to="{ name:'alertrecord'}">
                        <div class="left">
                            <img :src="require('../assets/img/alert2.svg')"/>
                        </div>
                        <div class="middle">
                            <div class="item">警报日志</div>
                        </div>
                        <div class="right">
                            <div class="num" v-if="statistic && statistic.alarmUnreadCount > 0">{{statistic ? statistic.alarmUnreadCount : ''}}</div>
                        </div>
                    </router-link>
                </li>
            </ul>
        </div>

        <div class="inner-content">
            <ul>
                <li>
                    <router-link :to="{ name:'editpwd'}">
                        <div class="left">
                            <img :src="require('../assets/img/pwd.svg')"/>
                        </div>
                        <div class="middle">
                            <div class="item">登录密码</div>
                        </div>
                        <div class="right">

                        </div>
                    </router-link>
                </li>
                <li @click="unbind">
                    <div class="left">
                        <img :src="require('../assets/img/unbind.svg')"/>
                    </div>
                    <div class="middle">
                        <div class="item">退出账号</div>
                    </div>
                    <div class="right"></div>
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
                    title: '确认要退出账号吗',
                    active: 0,
                    data: [
                        {content: '退出账号'}
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
                                        //this.showToastMsg('correct', '退出成功');
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
    .header-wrapper{
        height: 1.3rem;
        width: 100%;
        display: flex;
        flex-direction: column;
        background: #00436e;
        background-size: 100% 100%;
        position: relative;
    }
    .header{
        height: 1rem;
        width: calc( 100% - 0.3rem );
        display: flex;
        flex-direction: row;
        margin-left: 0.15rem;
        margin-right: 0.15rem;
        box-sizing: border-box;
        align-items: center;
    }
    .header .left{
        width: 0.48rem;
        height: 0.48rem;
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
        font-size: 0.16rem;
        color: #FFFFFF;
        margin-bottom: 0.08rem;
    }
    .header .right .address{
        font-family: PingFangSC-Regular;
        font-size: 0.12rem;
        color: rgba(255,255,255,0.80);
    }
    .menu{
        height: 0.86rem;
        width: calc( 100% - 0.3rem );
        display: flex;
        flex-direction: row;
        box-sizing: border-box;
        align-items: center;
        background: #FFFFFF;
        border-radius: 0.05rem;
        position: absolute;
        left: 0;
        top:1rem;
        margin-left: 0.15rem;
        margin-right: 0.15rem;
        padding-left: 0.2rem;
        padding-right: 0.2rem;
        box-shadow: 0 0.03rem 0.1rem 0 rgba(0,0,0,0.08);
    }
    .menu .item{
        width: 33.3%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .menu .item a{
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .menu .item img{
        width: 0.25rem;
        display: block;
    }
    .menu .item .add{
        font-size: 0.14rem;
        color: #767676;
        letter-spacing: 0;
        text-align: center;
        margin-top: 0.1rem;
    }

    .m-t{
        margin-top: 0.7rem;
    }
    .inner-content{
        box-sizing: border-box;
        padding-bottom: 0rem;
    }
    .inner-content ul{
        margin: 0;
        padding: 0;
        list-style: none;
        position: relative;
        margin-top: 0.12rem;
    }
    .inner-content ul:after{
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
    .inner-content ul li{
        background: white;
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: row;
    }
    .inner-content ul li:before{
        content: '';
        background-color: rgba(220,220,220,0.50);
        height: 0.01rem;
        transform: scaleY(0.5);
        width: 100%;
        position: absolute;
        left: 0.55rem;
        bottom: 0;
    }
    .inner-content ul li:last-child:before{
        left: 0;
    }
    .inner-content ul li:after{
        content: '';
        position: absolute;
        right: 0.15rem;
        top: 50%;
        width: 0.08rem;
        height: 0.08rem;
        border-right: 0.01rem solid #B2B2B2;
        border-bottom: 0.01rem solid #B2B2B2;
        transform: rotate(-45deg) translateY(-50%);
        transition: all 0.3s;
    }
    .inner-content ul li.active:after{
        border: none;
    }
    .inner-content ul li .left{
        width: 0.55rem;
        box-sizing: border-box;
        padding-left: 0.15rem;
        padding-right: 0.15rem;
        display: flex;
        align-items: center;
    }
    .inner-content ul li .middle{
        flex: 1;
        box-sizing: border-box;
        display: flex;
        align-items: flex-start;
        flex-direction: column;
    }
    .inner-content ul li .middle .item{
        font-family: PingFangSC-Regular;
        font-size: 0.16rem;
        color: #333333;
        line-height: 0.52rem;
        letter-spacing: 0;
    }
    .inner-content ul li .right{
        width: 1.45rem;
        padding: 0.1rem;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: flex-end;
        padding-left: 0.15rem;
    }
    .inner-content ul li .left img{
        display: block;
        width: 0.28rem;
        height: 0.28rem;
    }
    .inner-content ul li .right .num{
        font-size: 0.12rem;
        margin-right: 0.2rem;
        background: #FF5252;
        border-radius: 0.12rem;
        color: #fff;
        padding: 0.02rem 0.05rem;
    }
    .inner-content ul li a{
        display: flex;
        width: 100%;
        flex-direction: row;
        position: relative;
    }

</style>