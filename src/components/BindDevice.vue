<template>
    <div class="bind-page">
        <div class="bind-content">
            <div class="input-item has-border">
                <div class="left">
                    <div class="name">设备SN</div>
                </div>
                <div class="right">
                    <cube-input v-model="sn" class="bind-input" placeholder="请输入（扫描）设备SN"></cube-input>
                </div>
                <div class="scan-area" @click="scan">
                    <img :src="require('../assets/img/scan.png')"/>
                </div>
            </div>
            <div class="input-item has-border">
                <div class="left">
                    <div class="name">设备名称</div>
                </div>
                <div class="right">
                    <cube-input v-model="alias" class="bind-input" placeholder="请输入设备名称"></cube-input>
                </div>
            </div>
            <div class="input-item goto" v-if="1==2">
                <div class="left">
                    <div class="name">选择头像</div>
                </div>
                <div class="right"></div>
            </div>
        </div>
        <div class="sbbind" @click="sbmit">绑定设备</div>
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
    import { checkToken }  from '../utils/ajax';

    Vue.use(Loading);
    Vue.use(Button);
    Vue.use(Toast);
    Vue.use(Style);

    export default {
        data () {
            return {
                sn: '',
                alias: '',
                loading: false,
                toast: null
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
            sbmit(){
                if(!this.sn){
                    this.showToastMsg('warn', '设备SN不能为空');
                    return false;
                }
                if(!this.alias){
                    this.showToastMsg('warn', '设备别名不能为空');
                    return false;
                }

                if(!this.loading) {
                    this.loading = true;
                    this.showToastLoading('提交中...');
                    this.axios({
                        method: 'post',
                        url: 'v1/device/binding',
                        data: {
                            sn: this.sn,
                            deviceAlias: this.alias
                        }
                    }).then(function (response) {
                        this.loading = false;
                        this.hideToastLoading();
                        if (response.status == 200 && response.data.type == 'SUCCESS') {
                            this.showToastMsg('correct', '绑定成功');
                            setTimeout(()=>{
                                this.$router.back(-1);
                            }, 1500);
                        }
                        else {
                            this.showToastMsg('warn', response.data.content);
                        }
                    }.bind(this)).catch(function (error) {
                        this.loading = false;
                        this.hideToastLoading();
                        this.showToastMsg('warn', '未知错误');
                    }.bind(this));
                }
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
                            'scanQRCode'
                        ],
                    });
                    wx.ready(function(){
                        that.wxinit = true;
                    });
                    wx.error(function(res){
                        that.wxinit = false;
                    });
                }
            },
            scan(){
                var that = this;
                if(that.wxinit) {
                    wx.scanQRCode({
                        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                        scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                        success: function (res) {
                            var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                            if(result.indexOf(',') !== -1){
                                result = result.split(',')[1]
                            }

                            that.sn = result;
                        }
                    });
                }
                else{
                    that.showToastMsg('warn', '微信初始化失败');
                }
            },
        },
        mounted(){
            document.title = '添加设备';
            this.sign();
        }
    }
</script>
<style scoped="scoped">
    .bind-page{
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
    }
    .sbbind{
        position: relative;
        height: 0.48rem;
        line-height: 0.48rem;
        text-align: center;
        background: white;
        font-size: 0.15rem;
        margin-top: 0.12rem;
        box-shadow: inset 0 -0.01rem 0 0 rgba(206,206,206,0.50);
        color: #333333;
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
    .scan-area{
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        width: 0.6rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .scan-area img{
        height: 0.3rem;
    }
</style>