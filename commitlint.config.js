module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'change',
        'chore',
        'deprecate',
        'docs',
        'feat',
        'fix',
        'perf',
        'prepare',
        'refactor',
        'remove',
        'revert',
        'security',
        'style',
        'test',
      ],
    ],
  },
};
