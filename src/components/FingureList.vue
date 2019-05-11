<template>
    <div class="o-list-page">
        <div class="filter">
            <ul>
                <li @click="showDevice" :class="first ? 'active' : '' ">
                    <div class="diy">{{selectedDevice.name ? selectedDevice.name : '选择设备'}}</div>
                </li>
            </ul>
        </div>
        <cube-scroll ref="scroll" class="scroll-content" :options="options" :data="datalist" @pulling-down="onPullingDown" @pulling-up="onPullingUp" v-if="datalist.length > 0">
            <div class="inner-content">
                <ul>
                    <li v-for="(item, index) in datalist":key="index" @click="itemClick(item)" :class="selectedDevice.isAdmin ? '' : 'active'">
                        <div class="left">
                            <img :src="item.whiteListType == 'FINGER' ?  finger_icon : item.whiteListType == 'CARD' ? card_icon : item.whiteListType == 'PASSWORD' ? pwd_icon : key_icon"/>
                        </div>
                        <div class="middle">
                            <div class="item">别名： {{item.alias}}</div>
                            <div class="item no">序号： {{item.no}}</div>
                        </div>
                        <div class="right">
                            <div class="item" style="width: 0.1rem;"></div>
                        </div>
                    </li>
                </ul>
            </div>
        </cube-scroll>
        <div v-if="datalist.length == 0 && !loading" class="nodata">
            <img :src="nodata_img"/>
            <div class="notxt">您还没有添加指纹，先去添加一些吧</div>
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
        Picker,
        Swipe
    } from 'cube-ui'
    import { mapState } from 'vuex';
    import { checkToken }  from '../utils/ajax';

    Vue.use(Loading);
    Vue.use(Button);
    Vue.use(Toast);
    Vue.use(Style);
    Vue.use(Input);
    Vue.use(Scroll);
    Vue.use(Popup);
    Vue.use(Picker);
    Vue.use(Swipe);

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
                selectedDevice: {
                    id: '',
                    name: '',
                    img: '',
                    isAdmin: false
                },
                deviceOriginalList: [],
                devicelist: [],
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
                first: false,
                loading: false,
                toast: null,
                popComponent: null,
                finger_icon: require('../assets/img/fingeropen.svg'),
                pwd_icon: require('../assets/img/pwdopen.svg'),
                card_icon: require('../assets/img/cardopen.svg'),
                key_icon: require('../assets/img/keyopen.svg')
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

            showDevice() {
                if (!this.pickerDevice) {
                    this.pickerDevice = this.$createPicker({
                        title: '选择设备',
                        data: [this.devicelist],
                        onSelect: this.selectDevice,
                        onCancel: this.cancelDevice
                    })
                }
                this.pickerDevice.show();
                this.first = true;
            },
            selectDevice(selectedVal, selectedIndex, selectedText) {
                this.first = false;
                this.selectedDevice.id = selectedVal.join(', ');
                this.selectedDevice.name = selectedText.join(' ');
                this.selectedDevice.isAdmin = this.deviceOriginalList[selectedIndex.join(', ')].permissionType == 'PERMISSION_TYPE_ADMIN_SU' ? true : false;
                this.getFingureData(()=>{
                    this.$refs.scroll && this.$refs.scroll.forceUpdate();
                });
            },
            cancelDevice(){
                this.first = false;
            },

            getDeviceData(){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading('加载中...');
                        this.loading = true;
                        this.axios({
                            method: 'get',
                            url: '/v1/device/list',
                            params: {},
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.type == 'SUCCESS' && response.data.data.length > 0) {
                                let arr = [];
                                this.deviceOriginalList = response.data.data;
                                for(let i=0; i<response.data.data.length; i++){
                                    arr.push({
                                        text: response.data.data[i].deviceName,
                                        value: response.data.data[i].id
                                    });
                                }
                                this.devicelist = arr;
                                this.selectedDevice.id = response.data.data[0].id;
                                this.selectedDevice.name = response.data.data[0].deviceName;
                                this.selectedDevice.img = response.data.data[0].deviceTypePic;
                                this.selectedDevice.isAdmin = response.data.data[0].permissionType == 'PERMISSION_TYPE_ADMIN_SU' ? true : false;
                                this.getFingureData(()=>{
                                    this.$refs.scroll && this.$refs.scroll.forceUpdate();
                                });
                            }
                            else if (response.status == 200 && response.data.type == 'SUCCESS' && response.data.data.length == 0) {
                                this.showToastMsg('warn', '还没有设备，去添加一些吧');
                                setTimeout(()=>{
                                    this.$router.push({
                                        path: '/app/center'
                                    });
                                }, 2000);
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
            getFingureData(cb){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading('加载中...');
                        this.loading = true;
                        let url = '/v1/whiteList/list/' + this.selectedDevice.id;
                        this.axios({
                            method: 'get',
                            url: url,
                            params: {},
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.code == 0) {
                                this.datalist = response.data.data;
                                this.totalPage = 1;
                                this.totalCount = 1;
                            }
                            else {
                                this.datalist = [];
                                this.pageNumber = this.pageNumber - 1;
                                this.showToastMsg('warn', response.data.content);
                                cb();
                            }
                        }.bind(this)).catch(function (error) {
                            this.hideToastLoading();
                            this.datalist = [];
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
                    this.getFingureData(() => {
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
                    this.getFingureData(()=>{
                        this.$refs.scroll && this.$refs.scroll.forceUpdate();
                    });
                }
                else{
                    this.$refs.scroll && this.$refs.scroll.forceUpdate();
                }
            },
            itemClick(item){
                if(this.selectedDevice.isAdmin){
                    this.$router.push({
                        path: '/app/fingurealias/' + item.id
                    });
                }
            }
        },
        mounted() {
            document.title = '设备用户';
            let that = this;
            that.getDeviceData();
        }
    }
</script>
<style scoped="scoped">
    .o-list-page{
        font-size: 0.14rem;
        background-color: #f0eff4;
    }
    .filter{
        height: 0.45rem;
        background: white;
        box-shadow: inset 0 -0.01rem 0 0 rgba(206,206,206,0.50);
    }
    .filter ul{
        list-style: none;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
    }
    .filter ul li{
        width: 100%;
        height: 100%;
    }
    .filter ul li .diy{
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .filter ul li .diy:after{
        content: '';
        position: absolute;
        right: 0.22rem;
        top: 50%;
        width: 0.08rem;
        height: 0.08rem;
        border-right: 0.01rem solid #B2B2B2;
        border-bottom: 0.01rem solid #B2B2B2;
        transform: rotate(45deg) translateY(-50%);
        transition: all 0.3s;
        margin-top: -0.02rem;
        transform-origin:75% 45%;
    }
    .filter ul li.active .diy:after{
        transform: rotate(-135deg);
    }
    .scroll-content{
        height: calc( 100% - 0.45rem );
    }
    .inner-content{
        box-sizing: border-box;
        padding-bottom: 0rem;
    }
    .inner-content ul{
        margin: 0;
        padding: 0;
        list-style: none;
        margin-top: 0.12rem;
        position: relative;
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
        justify-content: center;
    }
    .inner-content ul li .left img{
        border-radius: 50%;
        display: block;
        height: 0.35rem;
        width: 0.35rem;
    }
    .inner-content ul li .middle .item{
        font-family: PingFangSC-Regular;
        font-size: 0.15rem;
        color: #555555;
        line-height: 0.25rem;
        letter-spacing: 0;
        font-weight: bold;
    }
    .inner-content ul li .middle .item.no{
        color: #898D96;
        font-size: 0.12rem;
        font-weight: normal;
    }
    .inner-content ul li .right{
        width: 0.95rem;
        padding-right: 0.35rem;
        text-align: right;
    }
    .inner-content ul li .right .item{
        font-size: 0.15rem;
        color: #6E6E6E;
        line-height: 0.55rem;
        letter-spacing: 0;
    }
    .inner-content ul li.active:after{
        border: none;
    }
</style>