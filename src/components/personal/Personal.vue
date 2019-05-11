<template>
    <div class="personalWrapper">
        <transition :name="transitionName">
            <router-view class="child-view"></router-view>
        </transition>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                transitionName: 'slide-left',
                outing: false,
            }
        },
        methods:{

        },
        watch: {
            '$route' (to, from) {
                if(from.name == 'signin' && to.name == 'signup'){
                    this.transitionName = 'slide-left';
                }
                else if(from.name == 'signup' && to.name == 'signin'){
                    this.transitionName = 'slide-right';
                }
                else if(from.name == 'signin' && to.name == 'forget'){
                    this.transitionName = 'slide-left';
                }
                else if(from.name == 'forget' && to.name == 'signin'){
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
   .personalWrapper{
       height: 100%;
       width: 100%;
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
       background-color: #fff;
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
</style>