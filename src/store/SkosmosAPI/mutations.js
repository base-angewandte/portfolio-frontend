/* eslint no-param-reassign: ["error", { "props": false }] */
export default {
  setLoading(s, msg) {
    s.loading = true;
    s.loadmsg = msg;
  },
  setLoadingFinished(s) {
    s.loading = false;
    s.loadmsg = 'inactive';
  },
  setApiLib(s, lib) {
    if (lib) {
      s.apilib = lib;
    }
  },
  setVocab(s, { uri, id }) {
    if (uri && id) {
      s.vocabs[id] = uri;
    }
  },
  setLang(s, lang) {
    if (lang) s.lang = lang;
  },
  setFields(s, fields) {
    if (fields && Array.isArray(fields)) s.fields = fields;
  },
  addField(s, field) {
    if (field && typeof field === 'string') s.fields.push(field);
  },
  removeField(s, field) {
    if (field && typeof field === 'string') {
      const i = s.fields.indexOf(field);
      if (i) s.fields.splice(i, 1);
    }
  },
};
