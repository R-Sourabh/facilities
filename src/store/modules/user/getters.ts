import { GetterTree } from 'vuex'
import UserState from './UserState'
import RootState from '@/store/RootState'

const getters: GetterTree <UserState, RootState> = {
    isAuthenticated (state) {
        return !!state.token;
    },
    isUserAuthenticated(state) {
        return state.token && state.current
    },
    getUserToken (state) {
        return state.token
    },
    getUserPermissions (state) {
        return state.permissions;
    },
    getUserProfile (state) {
        return state.current
    },
    getInstanceUrl (state) {
        const baseUrl = process.env.VUE_APP_BASE_URL;
        return baseUrl ? baseUrl : state.instanceUrl;
    },
    getBaseUrl (state) {
        let baseURL = process.env.VUE_APP_BASE_URL;
        if (!baseURL) baseURL = state.instanceUrl;
        return baseURL.startsWith('http') ? baseURL : `https://${baseURL}.hotwax.io/api/`;
    },
    getPwaState (state) {
        return state.pwaState;
    }
}
export default getters;