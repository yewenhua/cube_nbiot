import * as types from './types.js'

export default {
    [types.HIDELOADING]: ( state )=>{
        state.loading = false;
    },
    [types.SHOWLOADING]: ( state )=>{
        state.loading = true;
    },
    [types.LOGIN]: ( state, param )=>{
        var expire = {
            access_token: param.access_token,
            refresh_token: param.refresh_token,
            expire_time: (new Date()).getTime() + 2 * 3500 * 1000,
            refresh_time: (new Date()).getTime()
        }
        sessionStorage.setItem('token', JSON.stringify(expire));
        state.token = expire;
    },
    [types.LOGOUT]: ( state )=>{
        sessionStorage.removeItem('token');
        state.token = '';
    },
    [types.REGIST]: ( state )=>{
        state.token = '9527';
    },
    [types.INCREASE_CART]: ( state, param )=>{
        state.ball = param;
    },
    [types.DECREASE_CART]: ( state, param )=>{

    },
    [types.SUBCRIBE]: ( state, param )=>{
        sessionStorage.setItem('subCode', param.subCode);
        state.subCode = param.subCode;
    },
    [types.WECHAT]: ( state, param )=>{
        sessionStorage.setItem('wechat', JSON.stringify(param));
        state.wechat = param;
    },
    [types.USERINFO]: ( state, param )=>{
        sessionStorage.setItem('userInfo', JSON.stringify(param.userInfo));
        state.userInfo = param.userInfo;
    },
    [types.REFRESH]: ( state, param )=>{
        var expire = {
            access_token: param.access_token,
            refresh_token: param.refresh_token,
            expire_time: (new Date()).getTime() + 2 * 3500 * 1000,
            refresh_time: (new Date()).getTime() + 3600 * 1000 * 24 * 14
        }
        sessionStorage.setItem('token', JSON.stringify(expire));
        state.token = expire;
    }
}
