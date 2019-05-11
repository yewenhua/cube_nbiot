<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>
    export default {
        name: 'app'
    }
</script>

<style>
    #app {
        font-family: PingFangSC-Regular;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        width:100%;
        height:100%;
        overflow: hidden;
    }
    body,html{
        margin: 0px;
        height: 100%;
        width: 100%;
        font-size: 0.16rem;
        overflow: hidden;
    }
    * {
        margin: 0;
        padding: 0;
    }
    .nodata{
        height: 1.5rem;
        text-align: center;
        width: 100%;
    }
    .nodata img{
        margin: 0.3rem auto;
        width: 65%;
    }
    .nodata .text, .nodata .notxt{
        font-size: 0.14rem;
        color: #999;
    }
    .cube-toast-icon{
        position: relative;
    }
    .cube-toast-icon:before {
        position: absolute;
        left: 0;
        top: 0;
        font-size: 0.24rem;
    }
</style>
