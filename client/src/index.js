const wpkPro = document.createElement('script');
wpkPro.src = 'https://hs-schedule-1302770967.cos.ap-chengdu.myqcloud.com/live-room/io2.js';
document.getElementsByTagName('head')[0].appendChild(wpkPro);
wpkPro.onload = () => {
  console.log('wpkPro loaded');
};
