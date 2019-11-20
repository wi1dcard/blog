/*
  The module is created to disable the tag plugins (https://hexo.io/docs/tag-plugins)
  and nunjucks syntax, which causes troubles in parsing markdown often
*/

'use strict';

const extensions = ['md', 'markdown', 'mkd', 'mkdn', 'mdwn', 'mdtxt', 'mdtext'];

for (let ext of extensions) {
    let renderer = hexo.render.renderer.get(ext);
    if (renderer) {
        renderer.disableNunjucks = true;
        hexo.extend.renderer.register(ext, 'html', renderer);
    }
}
