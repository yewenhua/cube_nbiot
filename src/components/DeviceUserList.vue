<template>
    <div class="o-list-page">
        <cube-scroll ref="scroll" class="scroll-content" :options="options" :data="datalist" @pulling-down="onPullingDown" v-if="datalist.length > 0">
            <div class="inner-content">
                <cube-swipe>
                    <transition-group name="swipe" tag="ul">
                        <li class="swipe-item-wrapper" v-for="(data, index) in datalist" :key="data.item.id">
                            <cube-swipe-item
                                    ref="swipeItem"
                                    :btns="data.btns"
                                    :index="index"
                                    @btn-click="onBtnClick">
                                <div @click="onItemClick(data.item, index)" class="item-inner">
                                    <div class="left">
                                        <img :src="data.item.headIcon ? data.item.headIcon : require('../assets/img/sns_icon_8.png')"/>
                                    </div>
                                    <div class="middle">
                                        <div class="item">{{data.item.memberAccount}}（{{data.item.admin ? '管理员' : '订阅者'}}）</div>
                                        <div class="item type">订阅时间： {{data.item.time}}</div>
                                    </div>
                                    <div class="right">
                                        <div class="item">{{data.item.no}}号</div>
                                        <img :src="require('../assets/img/delete.svg')" class="delete" @click="deleteUser"/>
                                    </div>
                                </div>
                            </cube-swipe-item>
                        </li>
                    </transition-group>
                </cube-swipe>
            </div>
        </cube-scroll>
        <div v-if="datalist.length == 0 && !loading" class="nodata">
            <img :src="nodata_img"/>
            <div class="notxt">还没有订阅设备，先订阅一些吧</div>
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
        Popup,
        Swipe,
        ActionSheet
    } from 'cube-ui';
    import { mapState } from 'vuex';
    import { checkToken }  from '../utils/ajax';
    import { unixtimefromat }  from '../utils/utils';

    Vue.use(Loading);
    Vue.use(Button);
    Vue.use(Toast);
    Vue.use(Style);
    Vue.use(Input);
    Vue.use(Scroll);
    Vue.use(Popup);
    Vue.use(Swipe);
    Vue.use(ActionSheet);

    export default {
        computed: {
            ...mapState([
                'baseURL'
            ])
        },
        data () {
            return {
                id: '',
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
                        let url = '/v1/deviceUser/list/' + this.id;
                        this.axios({
                            method: 'get',
                            url: url,
                            params: {},
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.type == 'SUCCESS') {
                                let tmpList = response.data.data;
                                let formatData = [];
                                for(let i=0; i<tmpList.length; i++){
                                    tmpList[i].time = unixtimefromat(tmpList[i].createDate).date;
                                    formatData.push({
                                        item: tmpList[i],
                                        btns: [
                                            {
                                                action: 'delete',
                                                text: '删除',
                                                color: '#ff3a32'
                                            }
                                        ]
                                    });
                                }

                                this.datalist = formatData;
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
            onBtnClick(btn, index) {
                if (btn.action === 'delete') {
                    this.deleteUser();
                } else {
                    this.$refs.swipeItem[index].shrink();
                }
            },
            onItemClick(item) {

            },
            deleteUser(){
                this.$createActionSheet({
                    title: '确认要删除吗',
                    active: 0,
                    data: [
                        {content: '删除'}
                    ],
                    onSelect: () => {
                        if(!this.loading) {
                            checkToken(function () {
                                this.showToastLoading('提交中...');
                                this.loading = true;
                                let url = '/v1/deviceUser/delete/' + this.datalist[index].item.id;
                                this.axios({
                                    method: 'get',
                                    url: url,
                                    params: {},
                                }).then(function (response) {
                                    this.hideToastLoading();
                                    this.loading = false;
                                    if (response.status == 200 && response.data.type == 'SUCCESS') {
                                        this.datalist.splice(index, 1);
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
        mounted() {
            document.title = '设备用户';
            let that = this;
            that.id = that.$route.params.id;
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
        line-height: 0.27rem;
        letter-spacing: 0;
    }
    .inner-content ul li .middle .item.type{
        color: #898D96;
        font-size: 0.12rem;
    }
    .inner-content ul li .right{
        width: 0.95rem;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: center;
        padding-right: 0.3rem;
    }
    .inner-content ul li .left img{
        box-shadow: 0 0.02rem 0.04rem 0 rgba(0,0,0,0.14);
        border-radius: 50%;
        display: block;
        width: 0.35rem;
        height: 0.35rem;
    }
    .inner-content ul li .right .delete{
        width: 0.15rem;
        position: absolute;
        right: 0.15rem;
        top: 50%;
        transform: translateY(-50%);
        display: block;
    }
    .swipe-item-wrapper {
        overflow: hidden;
    }
    .cube-swipe-item{
        width: 100%;
    }
    .swipe-enter-active, .swipe-leave-active {
        transition: all .3s;
    }
    .item-inner {
        transition: all .3s;
        display: flex;
        box-sizing: border-box;
        padding-top: 0.1rem;
        padding-bottom: 0.1rem;
    }

</style>