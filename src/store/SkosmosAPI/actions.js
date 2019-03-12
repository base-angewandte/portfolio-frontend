import * as Api from './skosmos_api';

const $config = {
  withCredentials: true,
};

export default {
  fetchVocabs({ state, commit }, { lang }) {
    const params = {
      lang: state.lang,
      $config,
    };
    if (lang) params.lang = lang;
    return new Promise((resolve, reject) => {
      commit('setLoading', 'Loading available Vocabularies.');
      state.apilib.getVocabularies(params).then((res) => {
        if (res.data.vocabularies) {
          const sa = res.data.vocabularies;
          for (let i = 0; i < sa.length; i += 1) {
            commit('setVocab', sa[i]);
          }
          commit('setLoadingFinished');
          resolve(res.data.vocabularies);
        } else {
          // TODO: we need to have some overall error handling to inject here
        }
      }).catch((error) => {
        // TODO: we need to have some overall error handling to inject here
        commit('setLoadingFinished');
        reject(error);
      });
    });
  },
  init({ commit, dispatch }, config) {
    return new Promise((resolve, reject) => {
      if (![
        'baseURL', 'lang',
      ].every(opt => Boolean(config[opt]))) {
        // TODO: we need to have some overall error handling to inject here
        reject(new Error('baseURL is required in the config object.'));
      }
      Api.setDomain(config.baseURL);
      commit('setApiLib', Api);
      commit('setLang', config.lang);
      dispatch('fetchVocabs', {}).then((res) => {
        resolve(res);
      });
    });
  },
  /* eslint max-len: ["error", { "code": 200 }] */
  /**
   * Search concepts and collections by query term
   * @param query - the term to search for e.g. "cat*"
   * @param lang - language of labels to match, e.g. "en" or "fi"
   * @param labellang - language of labels to return, e.g. "en" or "fi"
   * @param vocab - vocabulary/vocabularies to limit search to, e.g. "yso" or "yso allars"
   * @param type - limit search to concepts of the given type(s), e.g. "skos:Concept".
   * @param parent - limit search to concepts which have the given concept (specified by URI) as parent in their transitive broader hierarchy
   * @param group - limit search to concepts in the given group (specified by URI)
   * @param maxhits - Maximum number of results to return. If not given, maxhits will default to 100. (default settable in config.inc)
   * @param offset - offset where to start in ther esult set, useful for paging the result. If not given, defaults to 0.
   * @param fields - space-separated list of extra fields to include in the results. e.g. "related" or "prefLabel" or any other skos property.
   * @param unique - boolean flag to indicate that each concept should be returned only once, instead of returning all the different ways it could match (for example both via prefLabel and altLabel).
   */
  getSearch({ state, commit }, { query, lang, vocab, type, parent, group, maxhits, offset, unique, fields }) {
    let p = {};
    const params = {
      query: `${query}*`,
      lang: state.lang,
      vocab,
      type,
      parent,
      group,
      maxhits,
      offset,
      unique,
      fields: state.fields,
      $config,
    };
    if (lang) params.lang = lang;
    if (fields) params.fields = fields;
    return new Promise((resolve, reject) => {
      if (query) {
        commit('setLoading', `Fetching ${query} from Repository`);
        p = state.apilib.getSearch(params);
      } else reject(new Error('Invalid or Insufficient Parameters'));
      p.then((res) => {
        commit('setLoadingFinished');
        resolve(res);
      }).catch((error) => {
        // TODO: we need to have some overall error handling to inject here
        commit('setLoadingFinished');
        reject(error);
      });
    });
  },
};
