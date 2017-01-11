!function(){
    var mod=/*manifest start*/{
	"citydata.js": {
		"hash": "6584ddcc2434d84f2f6089fe6ed27197",
		"path": "citydata.js"
	},
	"jxcar.js": {
		"hash": "a1fdd3420abc40a83a5cd43a10ec6a83",
		"path": "jxcar.js"
	},
	"marketDetails.js": {
		"hash": "b00af7ab4d29825c72cdfae00d9a4c55",
		"path": "marketDetails.js"
	},
	"newsDetails.js": {
		"hash": "ac510cf7fa677b6637adc8dcfa4dcb45",
		"path": "newsDetails.js"
	},
	"postDetails.js": {
		"hash": "e6be84d7f076023f966c498b30fa9aca",
		"path": "postDetails.js"
	},
	"postdebug.js": {
		"hash": "ada69987a929fbf4d4cc5012175f6b62",
		"path": "postdebug.js"
	},
	"sea.js": {
		"hash": "65323499997bf27a3c686bd461283c82",
		"path": "sea.js"
	},
	"seajs-combo.js": {
		"hash": "3ba424914828c8fe883c2acf12341f9f",
		"path": "seajs-combo.js"
	},
	"seajs-config.js": {
		"hash": "21ecf86f9e48625a175a28796fbce2ae",
		"path": "seajs-config.js"
	},
	"seajs-localcache.js": {
		"hash": "b75f72e2584e5d09c1ad9236d543d282",
		"path": "seajs-localcache.js"
	},
	"videoplayer.js": {
		"hash": "b3eb0203e0caacb69106d6d98342e928",
		"path": "videoplayer.js"
	},
	"yirenDetails.js": {
		"hash": "13e54a998cc11e47d9df506b761cb55d",
		"path": "yirenDetails.js"
	},
	"lib/cookie.js": {
		"hash": "fe7d037339c64001cbe39566e9354e77",
		"path": "lib/cookie.js"
	},
	"lib/lazyload.js": {
		"hash": "4356ce79271129e42cb2c01f743a4896",
		"path": "lib/lazyload.js"
	},
	"lib/tpl.js": {
		"hash": "a6ed12ab55f5d2a0a0e9f070f6ccb37d",
		"path": "lib/tpl.js"
	},
	"lib/zepto.js": {
		"hash": "4806078dc34b032d1de558f1e4ca4170",
		"path": "lib/zepto.js"
	},
	"tpl/index.js": {
		"hash": "4ce55816f1c33a90570f2d723ae5b0a6",
		"path": "tpl/index.js"
	},
	"tpl/marketDetails_tpl.js": {
		"hash": "326607044d9147cef90756d01a701482",
		"path": "tpl/marketDetails_tpl.js"
	},
	"tpl/newsDetails_tpl.js": {
		"hash": "4a432f26475ffd1ea840493278a2d0e2",
		"path": "tpl/newsDetails_tpl.js"
	},
	"tpl/postDetails.js": {
		"hash": "9e2cf2a88011100fb1a0652508cd9359",
		"path": "tpl/postDetails.js"
	},
	"tpl/postDetails_tpl.js": {
		"hash": "6d1c3bee4cb05e91430be1d2a5ecfc91",
		"path": "tpl/postDetails_tpl.js"
	},
	"tpl/yirenDetails_tpl.js": {
		"hash": "9b884f68ec657c80fe7ed9ae2a764e51",
		"path": "tpl/yirenDetails_tpl.js"
	},
	"map.js": {
		"hash": "1c439e1a4897be72316fba8034c054c4",
		"path": "map.js"
	}
}/*manifest end*/
    var map=[];
    var setdebug=location.href.indexOf('debug') > 0?1:0;
    for(var i in mod){
        if(setdebug){
            map.push([i,i+'?'+ +new Date()]);
        }else{
            map.push([i,i+'?'+mod[i]['hash']]);
        }
    }
    seajs.map=map;
    /*define("manifest",function(){
    		var manifest = {};
    		for(var key in mod){
    				manifest[key] = mod[key]['hash']
    		}
    		return mod
    }); */
}();