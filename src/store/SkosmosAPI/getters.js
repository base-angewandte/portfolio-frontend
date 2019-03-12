export default {
  isInitialized: s => Boolean(s.apilib && s.vocabs),
  isLoading: s => s.loading,
  f: s => name => s.apilib[name],
  vocab: s => name => s.vocabs[name],
};
