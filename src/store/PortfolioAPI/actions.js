import axios from 'axios';
import * as Api from './api';
import { i18n } from '../../plugins/i18n';

const $config = {
  withCredentials: true,
  xsrfCookieName: 'csrftoken_portfolio',
  xsrfHeaderName: 'X-CSRFToken',
};

const axiosInstance = axios.create();

const { CancelToken } = axios;
const cancel = {};

const axiosMaxRetries = 3;
let axiosTries = 0;

axiosInstance.interceptors.response.use((response) => {
  axiosTries = 0;
  return response;
}, (error) => {
  if (axiosTries >= axiosMaxRetries) {
    axiosTries = 0;
    window.location.href = `${process.env.VUE_APP_PREFIX}/Error`;
    return Promise.reject(error);
  }
  // if there is an error config to draw from and max tries are not reached try again
  if (((error.response && error.response.status >= 404)
    || !error.response) && error.config && axiosTries < axiosMaxRetries) {
    axiosTries += 1;
    return axios.request(error.config);
  }
  if (error.response && error.response.status === 403) {
    const openRequests = Object.keys(cancel);
    if (cancel && openRequests.length) {
      openRequests.forEach((kind) => {
        if (cancel[kind]) {
          cancel[kind]('authorization failed');
        }
      });
    }
    sessionStorage.clear();
    window.location.href = `${JSON.parse(process.env.VUE_APP_HEADER_URLS).LOGIN}`;
  }
  return Promise.reject(error);
});

Api.setAxiosInstance(axiosInstance);

export default {
  init({ commit, dispatch }, config) {
    const p = [];
    return new Promise((resolve, reject) => {
      if (![
        'baseURL',
      ].every((opt) => Boolean(config[opt]))) {
        reject(new Error('The Configuration is incomplete'));
      }
      Api.setDomain(config.baseURL);
      commit('setApiLib', Api);
      commit('setLang', config.lang);
      p.push(dispatch('fetchSchemas'));
      p.push(dispatch('fetchUser'));
      Promise.all(p).then((res) => {
        resolve(res);
      }).catch((err) => reject(err));
    });
  },
  fetchSchemas({ state, commit }) {
    return new Promise((resolve, reject) => {
      $config.headers = { 'Accept-Language': i18n.locale };
      commit('setLoading', 'Fetching available Schemas');
      if (cancel && cancel.schema) {
        cancel.schema('new schema request started');
      }
      /* eslint-disable-next-line */
      $config.cancelToken = new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancel.schema = c.bind(this);
      });
      state.apilib.api_v1_jsonschema_list({ $config }).then((res) => {
        commit('setSchemas', res.data);
        commit('setLoadingFinished', 'Fetching available Schemas finished');
        resolve(res.data);
      }).catch((error) => {
        commit('setLoadingFinished', 'Error while fetching available Schemas');
        reject(error);
      }).finally(() => {
        cancel.schema = null;
      });
    });
  },
  fetchUser({ state, commit }) {
    return new Promise((resolve, reject) => {
      commit('setLoading', 'Fetching User Data');
      if (cancel && cancel.user) {
        cancel.user('new user request started');
      }
      /* eslint-disable-next-line */
      $config.cancelToken = new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancel.user = c.bind(this);
      });
      state.apilib.api_v1_user_read({ $config }).then((res) => {
        commit('setUser', res.data);
        commit('setLoadingFinished', 'Fetching User Data finished');
        resolve(res.data);
      }).catch((error) => {
        commit('setLoadingFinished', 'Error while fetching User Data');
        reject(error);
      }).finally(() => {
        cancel.user = null;
      });
    });
  },
  async get({ state, commit }, {
    /* eslint-disable-next-line camelcase */
    kind, type, id, sort, offset, limit, q, link_selection_for,
  }) {
    // special case jsonschema where previous request should be cancelled if new one is started
    if (kind === 'jsonschema' || (kind === 'entry' && !id)) {
      // cancel previous request if there is any
      if (cancel && cancel[kind]) {
        cancel[kind](`new ${kind} request started`);
      }
      /* eslint-disable-next-line */
      $config.cancelToken = new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancel[kind] = c.bind(this);
      });
    }
    let p = {};
    return new Promise((resolve, reject) => {
      $config.headers = { 'Accept-Language': i18n.locale };
      if (kind && id) {
        commit('setLoading', `Getting ${kind} ${id} from Database`);
        p = state.apilib[`api_v1_${kind}_read`]({ id, $config });
      } else if (kind && !id) {
        commit('setLoading', `Getting Queryset of ${kind} from Database`);
        p = state.apilib[`api_v1_${kind}_list`]({
          type, sort, offset, limit, q, link_selection_for, $config,
        });
      } else reject(new Error('Invalid or Insufficient Parameters'));
      p.then((res) => {
        commit('setLoadingFinished', `Fetching ${kind} finished.`);
        resolve(res.data);
      }).catch((error) => {
        commit('setLoadingFinished', `Error while fetching ${kind}`);
        reject(error);
      }).finally(() => {
        cancel[kind] = null;
      });
    });
  },
  post({ state, commit }, { kind, id, data }) {
    let p = {};
    return new Promise((resolve, reject) => {
      if (kind && id && data) {
        commit('setLoading', `Updating ${kind} ${id} to Database`);
        p = state.apilib[`api_v1_${kind}_update`]({ id, data, $config });
      } else if (kind && data && !id) {
        commit('setLoading', `Creating a ${kind} in Database`);
        p = state.apilib[`api_v1_${kind}_create`]({ data, $config });
      } else reject(new Error('Invalid or Insufficient Parameters'));
      p.then((res) => {
        commit('setLoadingFinished', `Fetching ${kind} finished.`);
        resolve(res.data);
      }).catch((error) => {
        commit('setLoadingFinished', `Error while fetching ${kind}`);
        reject(error);
      });
    });
  },
  delete({ state, commit }, { kind, id }) {
    let p = {};
    return new Promise((resolve, reject) => {
      if (kind && id) {
        commit('setLoading', `Deleting ${kind} ${id} in Database`);
        p = state.apilib[`api_v1_${kind}_delete`]({ id, $config });
      } else reject(new Error('Invalid or Insufficient Parameters'));
      p.then((res) => {
        commit('setLoadingFinished', `Fetching ${kind} finished.`);
        resolve(res);
      }).catch((error) => {
        commit('setLoadingFinished', `Error while fetching ${kind}`);
        reject(error);
      });
    });
  },

  errorHandler({ state }, error) {
    // TODO: how do we want to handle error notifications?
    // it's probably better to let the component decide what to do with an error
    /* eslint-disable-next-line */
    console.log(state, error);
  },
};
