require('libs/adapter/builtin/index.js');
var Parser = require('libs/xmldom/dom-parser');
window.DOMParser = Parser.DOMParser;
require('libs/swan-downloader.js');
require('src/settings');
require('main');
require('./libs/adapter/engine/Device');  // provide device related infos
require('cocos2d-js');
require('./libs/adapter/engine/index.js');
swanDownloader.REMOTE_SERVER_ROOT = "";
swanDownloader.SUBCONTEXT_ROOT = "";
var pipeBeforeDownloader = cc.loader.md5Pipe || cc.loader.assetLoader;
cc.loader.insertPipeAfter(pipeBeforeDownloader, swanDownloader);

if (cc.sys.browserType === cc.sys.BROWSER_TYPE_BAIDU_GAME_SUB) {
    require('./libs/sub-context-adapter');
}
else {
    // Release Image objects after uploaded gl texture
    cc.macro.CLEANUP_IMAGE_CACHE = true;
}

window.boot();
