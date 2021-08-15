module.exports = {
  apollo: {
    configServerUrl: 'http://172.31.160.12:8080/',
    appId: 'hs-middlelayer-node', // 配置中心命名和项目名称保持一致,
    clusterName: 'default',
    namespaceName: [ 'application' ] // 两个namespace相同配置
  },
  avatarPreviewPrefix: 'https://mobile.hongsong.club/hs-fe-avatar-store',
  screenshotApi: 'https://gateway.hongsong.club/headlesschrome/api/screenshot',
  uploadCoursewareApi: 'http://api.hongsong.club/gateway/headlesschrome/api/screenshot',
  apolloCrmApi: 'https://prod-cd.hongsong.club',
  mongoose: {
    uri: 'mongodb://172.31.160.134:27017',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'hsdb',
      user: 'hs_write',
      pass: 'VnATHF1pN3n4'
    },
  }
};
