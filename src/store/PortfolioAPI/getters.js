module.exports = {
  isInitialized: s => Boolean(s.apilib && s.lang && s.schemas),
  isLoading: s => s.loading,
  f: s => name => s.apilib[name],
  schema: s => id => s.schemas[id],
  user: s => s.user,
  isAuthenticated: s => Boolean(s.user.email),
};
