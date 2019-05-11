<template>
    <div class="view-content">
        <cube-loading v-if="loading"></cube-loading>
        <transition :name="transitionName">
            <router-view class="child-view"></router-view>
        </transition>
    </div>
</template>

<script>
    import Vue from 'vue'
    import { mapGetters, mapState } from 'vuex'
    import {
        Loading
    } from 'cube-ui'

    Vue.use(Loading);

    export default {
        computed: {
            ...mapState([
                'collapse', 'sitename', 'userInfo'
            ]),
            ...mapGetters([
                'loading',
            ])
        },
        data () {
            return {
                transitionName: 'slide-left',
                outing: false,
            }
        },
        methods:{

        },
        components:{

        },
        watch: {
            '$route' (to, from) {
                if(from.name == 'center'){
                    this.transitionName = 'slide-left';
                }
                else if(to.name == 'center'){
                    this.transitionName = 'slide-right';
                }
                else if(from.name == 'fingurelist' && to.name == 'fingurealias'){
                    this.transitionName = 'slide-left';
                }
                else if(from.name == 'fingurealias' && to.name == 'fingurelist'){
                    this.transitionName = 'slide-right';
                }
                else if(from.name == 'devicelist' && to.name == 'devicedetail'){
                    this.transitionName = 'slide-left';
                }
                else if(from.name == 'devicedetail' && to.name == 'devicelist'){
                    this.transitionName = 'slide-right';
                }
                else if(from.name == 'devicelist' && to.name == 'binddevice'){
                    this.transitionName = 'slide-left';
                }
                else if(from.name == 'binddevice' && to.name == 'devicelist'){
                    this.transitionName = 'slide-right';
                }
                else if(from.name == 'devicedetail' && to.name == 'deviceuserlist'){
                    this.transitionName = 'slide-left';
                }
                else if(from.name == 'deviceuserlist' && to.name == 'devicedetail'){
                    this.transitionName = 'slide-right';
                }
                else{
                    this.transitionName = 'slide-left';
                }
            }
        },
    }
</script>

<style>
    .view-content{
        width:100%;
        height:100%;
        overflow: hidden;
    }
    .router-link-active{
        color:#f60;
        font-size: 0.3rem;
    }
    .child-view {
        position: absolute;
        width:100%;
        height:100%;
        left: 0;
        top:0;
        transition: transform 300ms cubic-bezier(.55,0,.1,1);
        backface-visibility: hidden;
        z-index: 0;
        background-color: #f0eff4;
        overflow: hidden;
    }
    .slide-left-enter, .slide-right-leave-active {
        opacity: 0;
        -webkit-transform: translate(100%, 0);
        transform: translate(100%, 0);
    }
    .slide-left-leave-active, .slide-right-enter {
        opacity: 0;
        -webkit-transform: translate(-100%, 0);
        transform: translate(-100%, 0);
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s ease;
    }
    .fade-enter, .fade-leave-active {
        opacity: 0
    }
    .zoom-enter-active {
        animation: zoomInLeft .5s;
    }
    .zoom-leave-active {
        animation: zoomOutRight .5s;
    }
    @keyframes zoomInLeft {
        from {
            opacity: 0;
            transform: scale3d(.1, .1, .1) translate3d(-1000px, 0, 0);
            animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
        }
        60% {
            opacity: 1;
            transform: scale3d(.475, .475, .475) translate3d(10px, 0, 0);
            animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
        }
    }
    @keyframes zoomOutRight {
        40% {
            opacity: 1;
            transform: scale3d(.475, .475, .475) translate3d(-42px, 0, 0);
        }
        to {
            opacity: 0;
            transform: scale(.1) translate3d(2000px, 0, 0);
            transform-origin: right center;
        }
    }
    .fadeup-enter-active {
        animation: fadeInUp .4s;
    }
    .fadeup-leave-active {
        animation: fadeInUp .4s reverse;
    }
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes fadeOutUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translate3d(0, -30px, 0);
        }
    }
    .clear{
        clear: both;
    }
</style>
