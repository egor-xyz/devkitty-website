module.exports = {
  extends: ['react-app', '@egor.xyz'],
  globals: {
    JSX: true
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    'comma-dangle': [
      'error',
      {
        arrays: 'never',
        exports: 'never',
        functions: 'never',
        imports: 'never',
        objects: 'never'
      }
    ],
    'jsx-a11y/anchor-has-content': 'off',
    'react/jsx-no-target-blank': 'off',
    'react-hooks/exhaustive-deps': 'off'
  }
};
