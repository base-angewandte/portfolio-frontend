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
  setSchemas(s, schemas) {
    if (schemas && Array.isArray(schemas)) {
      s.schemas = schemas;
    }
  },
  setUser(s, user) {
    if (typeof user === 'object') s.user = user;
  },
};
