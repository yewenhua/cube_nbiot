<template>
    <div class="o-list-page">
        <div class="filter">
            <ul>
                <li @click="showDevice" :class="first ? 'active' : '' ">
                    <div class="diy">
                        <div class="inner">{{selectedDevice.name ? selectedDevice.name : '选择设备'}}</div>
                    </div>
                </li>
                <li @click="showType" :class="second ? 'active' : '' ">
                    <div class="diy">
                        <div class="inner">{{selectedType.text ? selectedType.text : '开门方式'}}</div>
                    </div>
                </li>
                <li @click="showTime" :class="third ? 'active' : '' ">
                    <div class="diy">
                        <div class="inner">{{selectedTime.value ? selectedTime.value : '日期时间'}}</div>
                    </div>
                </li>
            </ul>
        </div>
        <cube-scroll ref="scroll" class="scroll-content" :options="options" :data="datalist" @pulling-down="onPullingDown" @pulling-up="onPullingUp" v-if="datalist.length > 0">
            <div class="inner-content">
                <ul>
                    <li v-for="(item, index) in datalist" :key="index">
                        <div class="left">
                            <img :src="item.deviceOpenType == 'FINGER' ?  finger_icon : item.deviceOpenType == 'CARD' ? card_icon : item.deviceOpenType == 'PASSWORD' ? pwd_icon : key_icon"/>
                        </div>
                        <div class="middle">
                            <div class="item">{{item.memberAlias}}开门了</div>
                            <div class="item time">{{item.time}}</div>
                        </div>
                        <div class="right">
                            <div class="item">{{item.deviceOpenType == 'FINGER' ?  '指纹' : item.deviceOpenType == 'CARD' ? '卡片' : item.deviceOpenType == 'PASSWORD' ? '密码' : '钥匙'}}开门</div>
                        </div>
                    </li>
                </ul>
            </div>
        </cube-scroll>
        <div v-if="datalist.length == 0 && !loading" class="nodata">
            <img :src="nodata_img"/>
            <div class="notxt">亲，没有数据</div>
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
        DatePicker
    } from 'cube-ui'
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
    Vue.use(Picker);
    Vue.use(DatePicker);

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
                devicelist: [],
                selectedDevice: {
                    id: '',
                    name: '',
                    img: ''
                },
                selectedTime: {
//                    text: unixtimefromat((new Date()).getTime()).date,
//                    value: unixtimefromat((new Date()).getTime()).date
                    text: '',
                    value: ''
                },
                selectedType: {
                    text: '所有方式',
                    value: ''
                },
                pageNumber: 1,
                pageSize: 10,
                totalPage: 1,
                totalCount: 0,
                options: {
                    pullDownRefresh: {
                        txt: '刷新中…'
                    },
                    pullUpLoad: {
                        txt: {
                            more: '加载更多',
                            noMore: '我是有底线的'
                        }
                    }
                },
                nodata_img: require('../assets/img/nodata.png'),
                loading: false,
                first: false,
                second: false,
                third: false,
                toast: null,
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
                this.first = true;
                this.pickerDevice.show();
            },
            selectDevice(selectedVal, selectedIndex, selectedText) {
                this.selectedDevice.id = selectedVal.join(', ');
                this.selectedDevice.name = selectedText.join(' ');
                this.first = false;
                this.pageNumber = 1;
                this.totalPage = 1;
                this.totalCount = 0;
                this.datalist = [];
                this.getLogData(()=>{
                    this.$refs.scroll && this.$refs.scroll.forceUpdate();
                });
            },
            cancelDevice(){
                this.first = false;
            },

            showType() {
                if (!this.pickerType) {
                    this.pickerType = this.$createPicker({
                        title: '开门方式',
                        data: [
                            [
                                { text: '所有方式', value: ''},
                                { text: '指纹开锁', value: 'FINGER'},
                                { text: '密码开锁', value: 'PASSWORD' },
                                { text: '卡片开门', value: 'CARD' }
                            ]
                        ],
                        onSelect: this.selectType,
                        onCancel: this.cancelType
                    })
                }
                this.second = true;
                this.pickerType.show()
            },
            selectType(selectedVal, selectedIndex, selectedText) {
                this.selectedType = {
                    text: selectedText.join(' '),
                    value: selectedVal.join(', ')
                };
                this.second = false;
                this.pageNumber = 1;
                this.totalPage = 1;
                this.totalCount = 0;
                this.datalist = [];
                this.getLogData(()=>{
                    this.$refs.scroll && this.$refs.scroll.forceUpdate();
                });
            },
            cancelType(){
                this.second = false;
            },

            showTime(){
                if (!this.datePicker) {
                    this.datePicker = this.$createDatePicker({
                        title: '选择日期',
                        min: new Date(2019, 1, 1),
                        max: new Date(2030, 12, 31),
                        value: new Date(),
                        onSelect: this.selectDate,
                        onCancel: this.cancelDate
                    });
                }

                this.third = true;
                this.datePicker.show();
            },
            selectDate(date, selectedVal, selectedText) {
                this.selectedTime = {
                    text: unixtimefromat((new Date(date)).getTime()).date,
                    value: unixtimefromat((new Date(date)).getTime()).date
                };
                this.third = false;
                this.pageNumber = 1;
                this.totalPage = 1;
                this.totalCount = 0;
                this.datalist = [];
                this.getLogData(()=>{
                    this.$refs.scroll && this.$refs.scroll.forceUpdate();
                });
            },
            cancelDate(){
                this.third = false;
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
                            if (response.status == 200 && response.data.type == 'SUCCESS'&& response.data.data.length > 0) {
                                let arr = [];
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
                                this.getLogData(()=>{
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
            getLogData(cb){
                if(!this.loading) {
                    checkToken(function () {
                        this.showToastLoading();
                        this.loading = true;
                        let url = '/v1/deviceOpenRecord/list/' + this.selectedDevice.id;
                        this.axios({
                            method: 'post',
                            url: url,
                            data: {
                                searchMap: {
                                    deviceOpenType_eq: [this.selectedType.value],
                                    createDate_eq: [this.selectedTime.value]
                                },
                                page: {
                                    number: this.pageNumber,
                                    size: this.pageSize
                                }
                            },
                        }).then(function (response) {
                            this.hideToastLoading();
                            this.loading = false;
                            if (response.status == 200 && response.data.type == 'SUCCESS' && response.data.data.content.length > 0) {
                                let oData = this.datalist;
                                for(let i=0; i<response.data.data.content.length; i++){
                                    response.data.data.content[i].time = unixtimefromat(response.data.data.content[i].createDate).all;
                                }
                                let nData = oData.concat(response.data.data.content);
                                this.datalist = nData;
                                this.totalPage = response.data.data.totalPages;
                                this.totalCount = response.data.data.total;
                            }
                            else if (response.status == 200 && response.data.type == 'SUCCESS' && response.data.data.content.length == 0) {

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
                    this.totalCount = 0;
                    this.datalist = [];
                    this.getLogData(() => {
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
                    this.getLogData(()=>{
                        this.$refs.scroll && this.$refs.scroll.forceUpdate();
                    });
                }
                else{
                    this.$refs.scroll && this.$refs.scroll.forceUpdate();
                }
            }
        },
        mounted() {
            document.title = '开锁日志';
            let that = this;
            that.getDeviceData(()=>{
                that.$refs.scroll && that.$refs.scroll.forceUpdate();
            });
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
        width: 33.3%;
        height: 100%;
    }
    .filter ul li .diy{
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }
    .filter ul li .diy .inner{
        width: calc( 100% - 0.23rem );
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-top: 0.05rem;
        padding-bottom: 0.05rem;
        display: inline-block;
        text-align: center;
    }
    .filter ul li .diy:after{
        content: '';
        position: absolute;
        right: 0.15rem;
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
        margin-top: 0.15rem;
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
        line-height: 0.25rem;
        letter-spacing: 0;
        font-weight: bold;
    }
    .inner-content ul li .middle .item.time{
        color: #898D96;
        font-size: 0.12rem;
        font-weight: normal;
    }
    .inner-content ul li .left img{
        border-radius: 50%;
        display: block;
        width: 0.35rem;
        height: 0.35rem;
    }
    .inner-content ul li .right{
        width: 0.95rem;
        box-sizing: border-box;
        padding-right: 0.15rem;
        text-align: right;
    }
    .inner-content ul li .right .item{
        font-size: 0.13rem;
        color: #555555;
        line-height: 0.50rem;
        letter-spacing: 0;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>