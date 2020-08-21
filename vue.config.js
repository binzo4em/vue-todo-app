const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'scss': path.join(__dirname, './src/scss/')
      }
    }
  },
  lintOnSave: false
}
