const process = require('process');
const log = require('hexo-log')({
    debug: false,
    silent: false
});

hexo.on('ready', function () {
    const tz = 'Asia/Shanghai';
    process.env['TZ'] = tz;
    log.info('Timezone has been set to ' + tz + '.');
});
