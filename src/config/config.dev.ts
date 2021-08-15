module.exports = {
  apollo: {
    configServerUrl: 'http://172.31.120.7:8281/',
    appId: 'hs-middlelayer-node', // 配置中心命名和项目名称保持一致,
    clusterName: 'default',
    namespaceName: [ 'application' ] // 两个namespace相同配置
  },
  avatarPreviewPrefix: 'http://mobile.dev.hongsong.club/hs-fe-avatar-store',
  screenshotApi: 'http://gateway.dev.hongsong.club/headlesschrome/api/screenshot',
  uploadCoursewareApi: 'http://dev.hongsong.club/gateway/headlesschrome/api/screenshot',
  apolloCrmApi: 'http://apollo-crm.dev.hongsong.club',
  mongoose: {
    uri: 'mongodb://172.31.120.38:27017',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'hsdb',
      user: 'hs_write',
      pass: 'gZ72RQza'
    },
  }
};
