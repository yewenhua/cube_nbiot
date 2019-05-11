import axios from 'axios'
import store from '../store/'
import * as types from '../store/types'
import router from '../router/index.js'
import { aesencode }  from './utils';

// axios 配置
axios.defaults.timeout = 30000;
axios.defaults.baseURL = store.state.baseURL;

// http request 拦截器
axios.interceptors.request.use(
    config => {
        if (store.state.token) {
            config.headers.Authorization = `Bearer ${store.state.token.access_token}`;
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    });

// http response 拦截器
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    store.commit(types.LOGOUT);
                    router.replace({
                        path: '/personal/signin',
                        query: {redirect: router.currentRoute.fullPath}
                    });
            }
        }
        return Promise.reject(error.response.data);
    });

export default axios;
