import Vue from 'vue'
import Router from 'vue-router'
import store from '../store/'

import Frame from '../components/frame/Frame.vue'
import Personal from '../components/personal/Personal.vue'

import Center from '../components/Center.vue'
import FingureList from '../components/FingureList.vue'
import FingureAlias from '../components/FingureAlias.vue'
import DeviceList from '../components/DeviceList.vue'
import BindDevice from '../components/BindDevice.vue'
import DeviceDetail from '../components/DeviceDetail.vue'
import LockRecord from '../components/LockRecord.vue'
import AlertRecord from '../components/AlertRecord.vue'
import EditPwd from '../components/EditPwd.vue'
import DeviceUserList from '../components/DeviceUserList.vue'
import Home from '../components/Home.vue'

import Signin from '../components/personal/Signin.vue'
import Signup from '../components/personal/Signup.vue'
import Forget from '../components/personal/Forget.vue'

Vue.use(Router)

const routes = [
    {
        path: '/app',
        component: Frame,
        children: [
            {
                path: 'center',
                name: 'center',
                component: Home,
                meta: {
                    requireAuth: true
                }
            },
            {
                path: 'fingurelist',
                name: 'fingurelist',
                component: FingureList,
                meta: {
                    requireAuth: true
                }
            },
            {
                path: 'fingurealias/:id',
                name: 'fingurealias',
                component: FingureAlias,
                meta: {
                    requireAuth: true
                }
            },
            {
                path: 'devicelist',
                name: 'devicelist',
                component: DeviceList,
                meta: {
                    requireAuth: true
                }
            },
            {
                path: 'binddevice',
                name: 'binddevice',
                component: BindDevice,
                meta: {
                    requireAuth: true
                }
            },
            {
                path: 'devicedetail/:id',
                name: 'devicedetail',
                component: DeviceDetail,
                meta: {
                    requireAuth: true
                }
            },
            {
                path: 'deviceuserlist/:id',
                name: 'deviceuserlist',
                component: DeviceUserList,
                meta: {
                    requireAuth: true
                }
            },
            {
                path: 'lockrecord',
                name: 'lockrecord',
                component: LockRecord,
                meta: {
                    requireAuth: true
                }
            },
            {
                path: 'alertrecord',
                name: 'alertrecord',
                component: AlertRecord,
                meta: {
                    requireAuth: true
                }
            },
            {
                path: 'editpwd',
                name: 'editpwd',
                component: EditPwd,
                meta: {
                    requireAuth: true
                }
            }
        ]
    },
    {
        path: '/personal',
        component: Personal,
        children: [
            {
                path: 'signin',
                name: 'signin',
                component: Signin,
                meta: {
                    requireAuth: false
                }
            },
            {
                path: 'signup',
                name: 'signup',
                component: Signup,
                meta: {
                    requireAuth: false
                }
            },
            {
                path: 'forget',
                name: 'forget',
                component: Forget,
                meta: {
                    requireAuth: false
                }
            },
        ]
    },
    {
        path: '*',
        redirect: '/app/center'
    }
];

const router = new Router({
    scrollBehavior: () => ({ y: 0 }), // 滚动条滚动的行为，不加这个默认就会记忆原来滚动条的位置
    routes
});

router.beforeEach((to, from, next) => {
    store.dispatch('showLoading');
    if (to.matched.some(r => r.meta.requireAuth)) {
        if (store.state.token) {
            next();
        }
        else {
            next({
                path: '/personal/signin',
                query: {redirect: to.fullPath}
            })
        }
    }
    else {
        next();
    }
});

router.afterEach(function (to) {
    store.dispatch('hideLoading')
});

export default router;
