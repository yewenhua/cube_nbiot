<template>
    <div class="detail-page">
        <div class="bind-content">
            <div class="input-item has-border">
                <div class="left">
                    <div class="name">设备型号</div>
                </div>
                <div class="right">
                    <div class="desc">{{device ? device.deviceTypeName : ''}}</div>
                </div>
            </div>
            <div class="input-item has-border">
                <div class="left">
                    <div class="name">设备名称</div>
                </div>
                <div class="right">
                    <cube-input v-model="alias" class="bind-input" placeholder="请输入设备名称" @blur="update"></cube-input>
                </div>
            </div>
            <div class="input-item jt">
                <router-link :to="{ name:'deviceuserlist', params: {id: id}}">
                    <div class="left">
                        <div class="name">关联用户</div>
                    </div>
                    <div class="right"></div>
                </router-link>
            </div>
        </div>
        <div class="sbbind" @click="unbind">删除设备</div>

        <div class="share">
            <div class="ercode">
                <img ref="qrcode" alt="分享二维码" :src="qrcode_url"></img>
            </div>
            <p class="desc">分享方式一：将二维码分享给亲朋好友，扫码订阅</p>
            <p class="desc">分享方式二：点击右上角【…】按钮分享给亲朋好友</p>
        </div>
        <div class="deviceUserList" v-if="1==2">
            <router-link :to="{ name:'deviceuserlist', params: {id: id}}">
               <img :src="require('../assets/img/deviceUserList.png')"/>
            </router-link>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import {
        Loading,
        Button,
        Toast,
        Style,
        ActionSheet
    } from 'cube-ui';
    import { checkToken }  from '../utils/ajax';
    import QRCode from 'qrcode';

    Vue.use(Loading);
    Vue.use(Button);
    Vue.use(Toast);
    Vue.use(Style);
    Vue.use(ActionSheet);

    export default {
        data () {
            return {
                id: '',
                alias: '',
                qrcode_url: '',
                share_url: '',
                code: '',
                wxinit: false,
                device: null
            }
        },
        methods: {
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
            showToastMsg(type, msg, time){
                this.$createToast({
                    type: type,
                    time: time || 1500,
                    txt: msg
                }).show();
            },
            getData(){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading();
                        this.loading = true;
                        let url = '/v1/device/get/' + this.id;
                        this.axios({
                            method: 'get',
                            url: url,
                            params: {},
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.type == 'SUCCESS') {
                                this.device = response.data.data;
                                this.alias = response.data.data.deviceAlias;
                                this.getCode();
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
                        title: '确认要删除吗',
                        active: 0,
                        data: [
                            {content: '删除'}
                        ],
                        onSelect: () => {
                            if(!this.loading) {
                                checkToken(function () {
                                    this.showToastLoading('提交中…');
                                    this.loading = true;
                                    let url = '/v1/device/unbinding/' + this.id;
                                    this.axios({
                                        method: 'get',
                                        url: url,
                                        params: {},
                                    }).then(function (response) {
                                        this.hideToastLoading();
                                        this.loading = false;
                                        if (response.status == 200 && response.data.type == 'SUCCESS') {
                                            this.showToastMsg('correct', '删除成功');
                                            setTimeout(()=>{
                                                this.$router.back(-1);
                                            }, 1500);
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
            },
            update(){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading('提交中…');
                        this.loading = true;
                        let url = '/v1/device/update/' + this.id;
                        this.axios({
                            method: 'post',
                            url: url,
                            data: {
                                deviceAlias: this.alias
                            },
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.type == 'SUCCESS') {
                                this.showToastMsg('correct', '更新成功');
                                setTimeout(()=>{
                                    this.$router.back(-1);
                                }, 1500);
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
            },
            getCode(){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading();
                        this.loading = true;
                        let url = '/v1/deviceShareApply/getShareApply';
                        this.axios({
                            method: 'post',
                            url: url,
                            data: {
                                deviceId: this.id,
                                deviceShareWay: "WEIXIN",
                                deviceShareType: "DEVICE",
                                deadline: "NONE"
                            },
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.type == 'SUCCESS') {
                                this.code = response.data.data.code;
                                this.generateQrcode();
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
            async generateQrcode(){
                let dom = this.$refs.qrcode;
                let that = this;
                let qr_msg = 'http://iot.voc.so/#/personal/signin?key=' + this.code;
                let url = await QRCode.toDataURL(qr_msg, {
                    margin: 0
                });
                this.qrcode_url = url;
                this.share_url = qr_msg;
                this.sign();
                console.log(qr_msg);
            },
            sign(){
                this.axios({
                    method: 'get',
                    url: '/global/getWxConfig',
                    params: {
                        url: location.href.split('#')[0]
                    },
                }).then(function (response) {
                    if (response.status == 200 && response.data.type == 'SUCCESS') {
                        this.init(response.data.data);
                    }
                }.bind(this)).catch(function (error) {

                }.bind(this));
            },
            init(data){
                var that = this;
                if(typeof WeixinJSBridge == "undefined"){
                    if(document.addEventListener){
                        document.addEventListener('WeixinJSBridgeReady', wechat, false);
                    }
                    else if(document.attachEvent){
                        document.attachEvent('WeixinJSBridgeReady', wechat);
                        document.attachEvent('onWeixinJSBridgeReady', wechat);
                    }
                }
                else{
                    wechat();
                }

                function wechat(){
                    wx.config({
                        debug:false,
                        signature: data.signature,
                        appId: data.appId,
                        timestamp: data.timestamp,
                        nonceStr: data.nonceStr,
                        jsApiList: [
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                        ],
                    });
                    wx.ready(function(){
                        that.wxinit = true;
                        let share_url = that.share_url;
                        console.log(share_url);

                        wx.onMenuShareAppMessage({
                            title: '订阅设备',
                            desc: '领取设备，关注实时信息',
                            link: share_url,
                            imgUrl: 'https://wl.voc.so/backend/img/logo.png',
                            type: '', // 分享类型,music、video或link，不填默认为link
                            dataUrl: '', //如果type是music或video，则要提供数据链接，默认为空
                            success: function(){
                                // 用户确认分享后执行的回调函数
                                console.log('SUCCESS');
                            },
                            cancel: function(){
                                // 用户取消分享后执行的回调函数
                                console.log('FAIL');
                            }
                        });

                        wx.onMenuShareTimeline({
                            title: '订阅设备',
                            link: share_url, // 分享链接
                            imgUrl: 'https://wl.voc.so/backend/img/logo.png', // 分享图标
                            success: function(){
                                // 用户确认分享后执行的回调函数
                                console.log('SUCCESS');
                            },
                            cancel: function(){
                                // 用户取消分享后执行的回调函数
                                console.log('FAIL');
                            }
                        });
                    });
                    wx.error(function(res){
                        that.wxinit = false;
                    });
                }
            }
        },
        mounted(){
            document.title = '设备详情';
            this.id = this.$route.params.id;
            this.getData();
            this.getData();
        }
    }
</script>
<style scoped="scoped">
    .detail-page{
        background-color: #f0eff4;
    }
    .bind-content{
        background: white;
        margin-top: 0.12rem;
        position: relative;
    }
    .bind-content:after{
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
    .input-item{
        margin-left: 0.15rem;
        width: calc( 100% - 0.15rem );
        height: 0.48rem;
        display: flex;
        flex-direction: row;
        background: white;
        position: relative;
    }
    .input-item.has-border:after{
        content: '';
        background-color: rgba(220,220,220,0.50);
        height: 0.01rem;
        transform: scaleY(0.5);
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
    }
    .input-item.jt:after{
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
    .input-item.jt a{
        display: flex;
        width: 100%;
    }
    .input-item .left{
        width: 0.8rem;
    }
    .input-item .right{
        width: calc( 100% - 0.8rem );
    }
    .input-item .left .name{
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: left;
        font-size: 0.15rem;
        color: #4e4e4e;
    }
    .input-item .right .desc{
        color: #555555;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 0.15rem;
        padding-left: 0.1rem;
    }
    .input-item.goto:after{
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
    .bind-content .cube-input::after{
        border: none;
    }
    .bind-content .cube-input{
        margin-bottom: 0rem;
        height: 100%;
        width: 100%;
    }
    .bind-content /deep/ .cube-input input.cube-input-field{
        height: 100%;
        margin-bottom: 0rem;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4f77ff;
    }
    .sbbind{
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
        height: 0.48rem;
        line-height: 0.48rem;
        text-align: center;
        background: white;
        font-size: 0.15rem;
        margin-top: 0.12rem;
        box-shadow: inset 0 -0.01rem 0 0 rgba(206,206,206,0.50);
        color: #FF5858;
    }
    .sbbind:after{
        content: '';
        background-color: rgba(220,220,220,0.50);
        height: 0.01rem;
        transform: scaleY(0.5);
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
    }
    .share{
        width: 100%;
        padding: 0.15rem;
        box-sizing: border-box;
    }
    .share .ercode{
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding-bottom: 0.2rem;
        padding-top: 0.2rem;
    }
    .share .ercode img{
        display: block;
        width: 1.8rem;
        height: 1.8rem;
        border: 0.15rem solid white;
    }
    .share .desc{
        width: 100%;
        font-size: 0.13rem;
        color: #555555;
        line-height: 0.25rem;
        text-align: center;
    }
    .deviceUserList{
        position: absolute;
        right: 0.15rem;
        bottom: 0.2rem;
    }
    .deviceUserList img{
        display: block;
        width: 0.4rem;
        height: 0.4rem;
        box-shadow: 0 0.02rem 0.04rem 0 rgba(0,0,0,0.14);
        border-radius: 50%;
    }
</style>