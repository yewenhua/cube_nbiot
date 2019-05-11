<template>
    <div class="wechat-page">
        <div class="w-content">
            <div class="input-item has-border">
                <div class="left">
                    <div class="name">原始密码</div>
                </div>
                <div class="right">
                    <cube-input v-model="oldpassword" type="password" class="bind-input" placeholder="请输入原始密码"></cube-input>
                </div>
            </div>
        </div>

        <div class="w-content">
            <div class="input-item has-border">
                <div class="left">
                    <div class="name">新密码</div>
                </div>
                <div class="right">
                    <cube-input v-model="newpassword" type="password" class="bind-input" placeholder="请输入新密码"></cube-input>
                </div>
            </div>
        </div>

        <div class="bind">
            <cube-button :primary="true" @click="sbmit">提交修改</cube-button>
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
    } from 'cube-ui'

    Vue.use(Loading);
    Vue.use(Button);
    Vue.use(Toast);
    Vue.use(Style);

    export default {
        data () {
            return {
                oldpassword: '',
                newpassword: '',
                loading: false,
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
            showToastMsg(type, msg, time){
                this.$createToast({
                    type: type,
                    time: time || 1500,
                    txt: msg
                }).show();
            },
            sbmit(){
                if(!this.oldpassword){
                    this.showToastMsg('warn', '原始密码不能为空');
                    return false;
                }
                if(!this.newpassword){
                    this.showToastMsg('warn', '新密码不能为空');
                    return false;
                }

                if(!this.loading) {
                    this.loading = true;
                    this.showToastLoading('加载中...');
                    this.axios({
                        method: 'post',
                        url: 'v1/account/updatePassword',
                        data: {
                            oldPass: this.oldpassword,
                            newPass: this.newpassword
                        }
                    }).then(function (response) {
                        this.loading = false;
                        if (response.status == 200 && response.data.code == 0) {
                            this.showToastMsg('correct', '修改成功');
                            setTimeout(()=>{
                                this.$router.push({ path: '/app/center' });
                            }, 1500);
                        }
                        else {
                            this.showToastMsg('warn', response.data.content);
                        }
                    }.bind(this)).catch(function (error) {
                        this.loading = false;
                        this.showToastMsg('warn', '未知错误');
                    }.bind(this));
                }
            }
        },
        mounted(){
            document.title = '修改密码';
        }
    }
</script>
<style scoped="scoped">
    .wechat-page{
        box-sizing: border-box;
        background: #fff;
        height: 100%;
        width: 100%;
        padding-top: 0.12rem;
    }
    .w-content{
        background: white;
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
    .input-item .codearea{
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .getcode{
        font-size: 0.12rem;
        border: 0.01rem solid #4F77FF;
        border-radius: 0.2rem;
        padding: 0.05rem 0.08rem;
        color: #4F77FF;
    }
    .getcode.active{
        border: 0.01rem solid #ccc;
        color: #ccc;
    }
    .w-content .cube-input::after{
        border: none;
    }
    .w-content .cube-input{
        margin-bottom: 0rem;
        height: 100%;
        width: 100%;
    }
    .w-content /deep/ .cube-input input.cube-input-field{
        height: 100%;
        margin-bottom: 0rem;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
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
        border-radius: 0.04rem;
    }
    .bind:active .cube-btn-primary {
        background: #095383;
    }
</style>