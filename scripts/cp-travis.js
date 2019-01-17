const fs = require('hexo-fs');

const log = require('hexo-log')({
    debug: false,
    silent: false
});

hexo.on('generateAfter', function () {
    fs.copyFile('source/.travis.yml', 'public/.travis.yml', function (err) {
        if (err) {
            throw err;
        } else {
            log.info('Travis CI configuration copied.');
        }
    });
});