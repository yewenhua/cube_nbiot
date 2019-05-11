<template>
    <div class="o-list-page">
        <cube-scroll ref="scroll" class="scroll-content" :options="options" :data="datalist" @pulling-down="onPullingDown" v-if="datalist.length > 0">
            <div class="inner-content">
                <ul>
                    <li v-for="(item, index) in datalist":key="index" @click="itemClick(item)" :class="item.permissionType != 'PERMISSION_TYPE_ADMIN_SU' ? 'active' : ''">
                        <div class="left">
                            <img :src="item.deviceTypePic"/>
                        </div>
                        <div class="middle">
                            <div class="item">{{item.deviceName}}（{{item.permissionType == 'PERMISSION_TYPE_ADMIN_SU' ? '管理员' : '订阅者'}}）</div>
                            <div class="item type">产品型号： {{item.deviceTypeName}}</div>
                        </div>
                        <div class="right">
                            <img :src="item.power == 100 ? require('../assets/img/dlcz.svg') : item.power > 50 ? require('../assets/img/dlbz2.svg') : require('../assets/img/dlbz1.svg')"/>
                            <div class="dl">{{item.power}}%</div>
                        </div>
                    </li>
                </ul>
            </div>
        </cube-scroll>
        <div v-if="datalist.length == 0 && !loading" class="nodata">
            <img :src="nodata_img"/>
            <div class="notxt">还没有设备，先添加一些吧</div>
            <div class="add-device pos-ab">
                <router-link :to="{ name:'binddevice'}">
                    <div class="add">添加设备</div>
                </router-link>
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
        Style,
        Input,
        Scroll,
        Popup
    } from 'cube-ui';
    import { mapState } from 'vuex';
    import { checkToken }  from '../utils/ajax';

    Vue.use(Loading);
    Vue.use(Button);
    Vue.use(Toast);
    Vue.use(Style);
    Vue.use(Input);
    Vue.use(Scroll);
    Vue.use(Popup);

    export default {
        computed: {
            ...mapState([
                'baseURL'
            ])
        },
        data () {
            return {
                scroll: null,
                datalist: [],
                pageNumber: 1,
                pageSize: 10,
                totalPage: 1,
                totalCount: 0,
                options: {
                    pullDownRefresh: {
                        txt: '刷新中…'
                    }
                },
                nodata_img: require('../assets/img/nodata.png'),
                searchkey: '',
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
                    time: 1000,
                    txt: msg
                }).show();
            },

            getData(cb){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading();
                        this.loading = true;
                        this.axios({
                            method: 'get',
                            url: '/v1/device/list',
                            params: {},
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.type == 'SUCCESS') {
                                this.datalist = response.data.data;
                                this.totalPage = 1;
                                this.totalCount = response.data.data.length;
                            }
                            else {
                                this.pageNumber = this.pageNumber - 1;
                                this.showToastMsg('warn', response.data.content);
                                cb();
                            }
                        }.bind(this)).catch(function (error) {
                            this.hideToastLoading();
                            this.loading = false;
                            this.showToastMsg('warn', '获取失败');
                            this.pageNumber = this.pageNumber - 1;
                            cb();
                        }.bind(this));
                    }.bind(this));
                }
            },
            onPullingDown() {
                if(!this.loading) {
                    this.totalPage = 1;
                    this.pageNumber = 1;
                    this.datalist = [];
                    this.getData(() => {
                        this.$refs.scroll && this.$refs.scroll.forceUpdate();
                    });
                }
                else{
                    this.$refs.scroll && this.$refs.scroll.forceUpdate();
                }
            },
            onPullingUp() {
                if(this.pageNumber < this.totalPage && !this.loading){
                    this.pageNumber = this.pageNumber + 1;
                    this.getData(()=>{
                        this.$refs.scroll && this.$refs.scroll.forceUpdate();
                    });
                }
                else{
                    this.$refs.scroll && this.$refs.scroll.forceUpdate();
                }
            },

            itemClick(item){
                if(item.permissionType == 'PERMISSION_TYPE_ADMIN_SU'){
                    this.$router.push({
                        path: '/app/devicedetail/' + item.id
                    });
                }
            }
        },
        mounted() {
            document.title = '我的设备';
            let that = this;
            that.getData(()=>{
                this.$refs.scroll && this.$refs.scroll.forceUpdate();
            });
        }
    }
</script>
<style scoped="scoped">
    .o-list-page{
        font-size: 0.14rem;
        background-color: #f0eff4;
    }
    .scroll-content{
        height: 100%;
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
        padding-top: 0.1rem;
        padding-bottom: 0.1rem;
    }
    .inner-content ul li:before{
        content: '';
        background-color: rgba(220,220,220,0.50);
        height: 0.01rem;
        transform: scaleY(0.5);
        width: 100%;
        position: absolute;
        left: 0.15rem;
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
        width: 0.65rem;
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
        font-size: 0.15rem;
        color: #555555;
        line-height: 0.25rem;
        letter-spacing: 0;
        font-weight: bold;
    }
    .inner-content ul li .middle .item.type{
        color: #898D96;
        font-size: 0.12rem;
        font-weight: normal;
    }
    .inner-content ul li .right{
        width: 1.45rem;
        padding: 0.1rem;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: center;
        padding-left: 0.15rem;
    }
    .inner-content ul li .left img{
        box-shadow: 0 0.02rem 0.04rem 0 rgba(0,0,0,0.14);
        border-radius: 50%;
        display: block;
        width: 0.35rem;
        height: 0.35rem;
    }
    .inner-content ul li .right img{
        max-height: 0.2rem;
        max-width: 0.2rem;
        display: block;
    }
    .inner-content ul li .right .dl{
        font-size: 0.15rem;
        color: #555555;
        margin-left: 0.1rem;
    }
    .add-device{
        position: relative;
        background: white;
        margin-top: 0.12rem;
    }
    .add-device:after{
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
    .add-device .add{
        font-size: 0.15rem;
        color: #555555;
        line-height: 0.55rem;
        letter-spacing: 0;
        text-align: center;
    }
    .pos-ab{
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
    }
</style>