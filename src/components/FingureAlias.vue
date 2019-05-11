<template>
    <div class="alias-page">
        <div class="headimg" v-if="1==2">
            <img :src="require('../assets/img/sns_icon_8.png')"/>
        </div>
        <div class="setting">
            <div class="input-item">
                <div class="left">
                    <div class="name">归属设备</div>
                </div>
                <div class="right">
                    <div class="value">{{fingure ? fingure.deviceName : ''}}</div>
                </div>
            </div>
            <div class="input-item">
                <div class="left">
                    <div class="name">{{fingure && fingure.whiteListType == 'FINGER' ?  '指纹' : fingure && fingure.whiteListType == 'CARD' ? '卡片' : fingure && fingure.whiteListType == 'PASSWORD' ? '密码' : '钥匙'}}序号</div>
                </div>
                <div class="right">
                    <div class="value">{{fingure ? fingure.no : ''}}号</div>
                </div>
            </div>
            <div class="input-item">
                <div class="left">
                    <div class="name">{{fingure && fingure.whiteListType == 'FINGER' ?  '指纹' : fingure && fingure.whiteListType == 'CARD' ? '卡片' : fingure && fingure.whiteListType == 'PASSWORD' ? '密码' : '钥匙'}}别名</div>
                </div>
                <div class="right">
                    <cube-input v-model="alias" class="bind-input" placeholder="请输入别名（如女儿，儿子，老婆）"></cube-input>
                </div>
            </div>

            <div class="bind">
                <cube-button :primary="true" @click="sbmit">保存设置</cube-button>
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
    import { checkToken }  from '../utils/ajax';

    Vue.use(Loading);
    Vue.use(Button);
    Vue.use(Toast);
    Vue.use(Style);

    export default {
        data () {
            return {
                id: '',
                type: '',
                alias: '',
                fingure: null,
                loading: false,
                toast: null,
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
            showToastMsg(type, msg){
                this.$createToast({
                    type: type,
                    time: 1500,
                    txt: msg
                }).show();
            },
            getData(){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading();
                        this.loading = true;
                        let url = '/v1/whiteList/get/' + this.id;
                        this.axios({
                            method: 'get',
                            url: url,
                            params: {},
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.type == 'SUCCESS') {
                                this.fingure = response.data.data;
                                this.alias = response.data.data.alias;
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
            sbmit(){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading('提交中…');
                        this.loading = true;
                        let url = '/v1/whiteList/update/' + this.id;
                        this.axios({
                            method: 'post',
                            url: url,
                            data: {
                                alias: this.alias
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
            }
        },
        mounted(){
            document.title = '设备用户别名';
            this.id = this.$route.params.id;
            this.getData();
        }
    }
</script>
<style scoped="scoped">
    .alias-page{
        background: white;
    }
    .headimg{
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 1.2rem;
    }
    .headimg img{
        height: 0.66rem;
        width: 0.66rem;
        display: block;
        border: 0.02rem solid white;
        border-radius: 50%;
    }
    .input-item{
        margin-left: 0.15rem;
        margin-right: 0.15rem;
        width: calc( 100% - 0.3rem );
        height: 0.45rem;
        display: flex;
        flex-direction: row;
        position: relative;
    }
    .input-item:after{
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
        color: #555555;
    }
    .input-item .right .value{
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: left;
        font-size: 0.15rem;
        color: #555555;
        padding-left: 0.1rem;
    }
    .input-item .cube-input{
        margin-bottom: 0rem;
        height: 100%;
        width: 100%;
        background: transparent;
    }
    .input-item .cube-input::after{
        border: none;
    }
    .bind{
        margin-top: 0.4rem;
        padding-left: 0.15rem;
        padding-right: 0.15rem;
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
    }
    .bind:active .cube-btn-primary {
        background: #095383;
    }
    .setting /deep/ .cube-input input.cube-input-field{
        color: rgba(79,119,255,1);
    }
</style>