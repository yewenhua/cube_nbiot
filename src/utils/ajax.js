import store from '../store/'
import router from '../router/index.js'
import * as types from '../store/types'
import axios from 'axios'

export function checkToken(callback){
    var expire_time = store.state.token ? store.state.token.expire_time : 0;
    var refresh_time = store.state.token ? store.state.token.refresh_time : 0;
    var now = (new Date()).getTime();
    if (now < expire_time) {
        //token有效
        callback();
    }
    else if(now >= expire_time && now < refresh_time){
        //refresh_time有效
        store.dispatch('showLoading');
        var url = 'oauth/token?client_id=e41df05b-f963-4a66-a8cd-8596d1564fee&client_secret=3ca4b24f-d2cd-44cc-b5c9-31f88c7c5631&grant_type=refresh_token&refresh_token=' + `${store.state.token.refresh_token}`;
        axios({
            method: 'post',
            url: url,
            data: {},
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        })
        .then(function (response) {
            store.dispatch('refresh', {
                access_token: response.data.data.access_token,
                refresh_token: response.data.data.refresh_token
            });
            callback();
            store.dispatch('hideLoading')
        })
        .catch(function (error) {
            store.commit(types.LOGOUT);
            router.replace({
                path: '/personal/signin',
                query: {redirect: router.currentRoute.fullPath}
            });
            store.dispatch('hideLoading')
        });
    }
    else{
        //都失效
        store.commit(types.LOGOUT);
        router.replace({
            path: '/personal/signin',
            query: {redirect: router.currentRoute.fullPath}
        });
    }
}

export function checkSigninPage(callback){
    var expire_time = store.state.token ? store.state.token.expire_time : 0;
    var refresh_time = store.state.token ? store.state.token.refresh_time : 0;
    var now = (new Date()).getTime();
    if (now < expire_time) {
        //token有效
        callback();
    }
    else if(now >= expire_time && now < refresh_time){
        //refresh_time有效
        store.dispatch('showLoading');
        var url = 'oauth/token?client_id=e41df05b-f963-4a66-a8cd-8596d1564fee&client_secret=3ca4b24f-d2cd-44cc-b5c9-31f88c7c5631&grant_type=refresh_token&refresh_token=' + `${store.state.token.refresh_token}`;
        axios({
            method: 'post',
            url: url,
            data: {},
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        })
        .then(function (response) {
            if(response.data.type == 'SUCCESS') {
                store.dispatch('refresh', {
                    access_token: response.data.data.access_token,
                    refresh_token: response.data.data.refresh_token
                });
                callback();
                store.dispatch('hideLoading');
            }
            else{
                store.commit(types.LOGOUT);
                store.dispatch('hideLoading');
            }
        })
        .catch(function (error) {
            store.commit(types.LOGOUT);
            store.dispatch('hideLoading');
        });
    }
    else{
        //都失效
        store.commit(types.LOGOUT);
    }
}