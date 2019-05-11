<template>
    <div class="wechat-page">
        <div class="w-content">
            <div class="input-item has-border">
                <div class="left">
                    <div class="name">手机号码</div>
                </div>
                <div class="right">
                    <cube-input v-model="mobile" type="number" class="bind-input" @blur="mobileBlur" placeholder="请输入手机号码"></cube-input>
                </div>
            </div>
            <div class="input-item has-border">
                <div class="left">
                    <div class="name">验证码</div>
                </div>
                <div class="right">
                    <cube-input v-model="code" class="bind-input" placeholder="请输入验证码" @blur="codeBlur"></cube-input>
                </div>
                <div class="codearea">
                    <div class="getcode" @click="sendcode" :class="clickActive ? 'active' : ''">{{sendbtn}}</div>
                </div>
            </div>
        </div>

        <div class="w-content">
            <div class="input-item has-border">
                <div class="left">
                    <div class="name">登陆密码</div>
                </div>
                <div class="right">
                    <cube-input v-model="password" type="password" class="bind-input" placeholder="输入新登陆密码"></cube-input>
                </div>
            </div>
            <div class="input-item has-border">
                <div class="left">
                    <div class="name">确认密码</div>
                </div>
                <div class="right">
                    <cube-input v-model="repassword" type="password" class="bind-input" placeholder="确认新登陆密码"></cube-input>
                </div>
            </div>
        </div>

        <div class="bind">
            <cube-button :primary="true" @click="sbmit">提交</cube-button>
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
                password: '',
                repassword: '',
                mobile: '',
                code: '',
                loading: false,
                mobile_check: false,
                mobile_exist: false,
                code_check: false,
                code_right: false,
                clickActive: false,
                sendbtn: '获取验证码',
                leftsecond: 60,
                toast: null
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
            mobileBlur(){
                var that = this;
                var mobilereg = /^1[0-9]{10}$/;
                if (that.mobile && that.mobile.length == 11 && mobilereg.test(that.mobile)) {
                    that.loading = true;
                    that.showToastLoading('手机号码验证中...');
                    that.axios.get('/v1/account/global/validate', {
                        params: {
                            fieldId: 'phone',
                            fieldValue: that.mobile
                        }
                    })
                    .then(function (response) {
                        that.loading = false;
                        if (response.status = 200 && response.data.content.indexOf('账号已经存在') != -1) {
                            that.mobile_check = true;
                            that.mobile_exist = true;
                            that.showToastMsg('warn', '验证成功', 2000);
                        }
                        else {
                            that.mobile_check = true;
                            that.mobile_exist = false;
                            that.showToastMsg('warn', response.data.content || '手机验证失败');
                        }
                    })
                    .catch(function (error) {
                        that.mobile_check = false;
                        that.mobile_exist = false;
                        that.showToastMsg('warn', '未知错误');
                        that.loading = false;
                    });
                }
                else{
                    that.showToastMsg('warn', '请填写正确手机');
                }
            },
            sendcode(){
                var that = this;
                var mobilereg = /^1[0-9]{10}$/;
                if (that.mobile && that.mobile.length == 11 && mobilereg.test(that.mobile)) {
                    if(!that.mobile_check){
                        that.showToastMsg('warn', '手机号码验证中…');
                        return false;
                    }

                    if (that.mobile_exist) {
                        if (!that.clickActive) {
                            that.clickActive = true;
                            that.sendbtn = '60S后重试';

                            var tt = setInterval(function () {
                                if (that.leftsecond > 1) {
                                    var temp = that.leftsecond - 1;
                                    that.leftsecond = temp;
                                    that.sendbtn = temp + 'S后重试';
                                }
                                else {
                                    clearInterval(tt);
                                    that.leftsecond = 60;
                                    that.clickActive = false;
                                    that.sendbtn = '获取验证码';
                                }
                            }, 1000);

                            that.loading = true;
                            let url = '/v1/sms/global/generator/PasswordForget/' + that.mobile;
                            that.axios({
                                method: 'get',
                                url: url,
                                params: {

                                },
                                headers: {'Content-Type': 'application/json'},
                            })
                            .then(function (response) {
                                that.loading = false;
                                if(response.status = 200 && response.data.type == 'SUCCESS'){
                                    that.showToastMsg('correct', '发送成功');
                                }
                                else{
                                    that.showToastMsg('warn', response.data.content || '服务器错误');
                                }
                            })
                            .catch(function (error) {
                                that.showToastMsg('warn', '未知错误');
                                that.loading = false;
                            });
                        }
                    }
                    else {
                        //该手机未注册
                        that.showToastMsg('warn', '该手机号码未注册');
                    }
                }
                else {
                    //请填写正确手机
                    that.showToastMsg('warn', '请填写正确手机');
                }
            },
            codeBlur(){
                var that = this;
                if(!that.mobile){
                    that.showToastMsg('warn', '手机号码不能为空');
                    return false;
                }
                if(!that.mobile_check){
                    that.showToastMsg('warn', '手机号码验证中…');
                    return false;
                }
                if(!that.mobile_exist){
                    that.showToastMsg('warn', '手机号码不存在');
                    return false;
                }
                if(!that.code){
                    that.showToastMsg('warn', '验证码不能为空');
                    return false;
                }

                that.loading = true;
                that.showToastLoading('验证码验证中...');
                let url = '/v1/sms/global/validate/PasswordForget/' + that.mobile;
                that.axios.get(url, {
                    params : {
                        code: that.code
                    }
                })
                .then(function (response) {
                    that.loading = false;
                    if(response.status = 200 && response.data.type == 'SUCCESS'){
                        that.code_check = true;
                        that.code_right = true;
                        that.showToastMsg('warn', '验证成功', 2000);
                    }
                    else{
                        that.code_check = true;
                        that.code_right = false;
                        that.showToastMsg('warn', response.data.content || '验证码错误');
                    }
                })
                .catch(function (error) {
                    that.code_check = false;
                    that.code_right = false;
                    that.showToastMsg('warn', '未知错误');
                    that.loading = false;
                });
            },
            sbmit(){
                if(!this.mobile){
                    this.showToastMsg('warn', '手机号码不能为空');
                    return false;
                }
                if(!this.code){
                    this.showToastMsg('warn', '验证码不能为空');
                    return false;
                }
                if(!this.password){
                    this.showToastMsg('warn', '登录密码不能为空');
                    return false;
                }
                if(!this.repassword){
                    this.showToastMsg('warn', '确认密码不能为空');
                    return false;
                }
                if(this.password != this.repassword){
                    this.showToastMsg('warn', '两次密码不一致');
                    return false;
                }
                if(!this.code_check){
                    this.showToastMsg('warn', '验证码验证中…');
                    return false;
                }
                if(!this.code_right){
                    this.showToastMsg('warn', '验证码错误');
                    return false;
                }

                if(!this.loading) {
                    this.loading = true;
                    this.showToastLoading('提交中...');
                    this.axios({
                        method: 'post',
                        url: 'v1/account/global/forgetPassword',
                        data: {
                            username: this.mobile,
                            password: this.password,
                            code: this.code
                        }
                    }).then(function (response) {
                        this.loading = false;
                        if (response.status == 200 && response.data.type == 'SUCCESS') {
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
            document.title = '忘记密码';
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
        height: 100%;
    }
    .input-item .right{
        width: calc( 100% - 0.8rem );
        height: 100%;
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
        border: 0.01rem solid #1276B6;
        border-radius: 0.2rem;
        padding: 0.05rem 0.08rem;
        color: #1276B6;
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