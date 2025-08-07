import github from 'eslint-plugin-github'

export default [
  github.getFlatConfigs().internal,
  github.getFlatConfigs().recommended,
  ...github.getFlatConfigs().typescript,
  {
    rules: {
      'i18n-text/no-en': 'off'
    }
  }
]
