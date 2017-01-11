define("seajs-localcache",['manifest'], function(require){
    if(!window.localStorage || seajs.data.debug) return;

    var module = seajs.Module,
        data = seajs.data,
        fetch = module.prototype.fetch,
        combosplit=data.combosplit||'/*! xcar_touch',
        defaultSyntax = ['??',','];
    var localfix=data.localfix||'';
    //var remoteManifest = (data.localcache && data.localcache.manifest) || {}
    var mod = require('manifest');
    var manifestkey=data.manifestkey||'manifest';
    var manifest = {};
    for(var key in mod){
        //manifest[key] = mod[key]['path'];
        manifest[mod[key]['path']]=key;
    }
    var remoteManifest=manifest;
    var storage = {
        _maxRetry: 1,
        _retry: true,
        get: function(key, parse){
            var val;
            try{
                val = localStorage.getItem(key);
            }catch(e){
                return undefined;
            }
            if(val){
                return parse? JSON.parse(val):val;
            }else{
                return undefined;
            }
        },
        set: function(key, val, retry){
            retry = ( typeof retry == 'undefined' ) ? this._retry : retry;
            try{
                localStorage.setItem(key, val);
            }catch(e){
                if(retry) {
                    var max = this._maxRetry;
                    while(max > 0) {
                        max --;
                        this.removeAll();
                        this.set(key, val, false);
                    }
                }
            }
        },
        remove: function(url){
            try{
                localStorage.removeItem(url);
            }catch(e){}
        },
        removeAll: function(){
            /**
             * Default localstorage clean
             * delete localstorage items which are not in latest manifest
             */
            var prefix = (data.localcache && data.localcache.prefix) || /^https?\:/;
            for(var i=localStorage.length-1; i>=0; i--) {
                var key = localStorage.key(i);
                if(!prefix.test(key)) continue;  //Notice: change the search pattern if not match with your manifest style
                if(!remoteManifest[key]){
                    localStorage.removeItem(key);
                }
            }
        }
    }

    var localManifest = storage.get(manifestkey,true) || {};
    if(!remoteManifest){
        //failed to fetch latest version and local version is broken.
        return;
    }

    /**
     * Check whether the code is complete and clean
     * @param url
     * @param code
     * @return {Boolean}
     */
    var validate = (data.localcache && data.localcache.validate) || function(url, code){
            if(!code || !url) return false;
            else return true;
        }

    var fetchAjax = function(url, callback){
        var xhr = new window.XMLHttpRequest();
        var timer = setTimeout(function(){
            xhr.abort();
            callback(null);
        }, (data.localcache && data.localcache.timeout) || 30000);
        xhr.open('GET',url,true);
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                clearTimeout(timer);
                if(xhr.status === 200){
                    callback(xhr.responseText);
                }else{
                    callback(null);
                }
            }
        }
        xhr.send(null);
    }

    /**
     * run code in window environment
     * @param url
     * @param code
     */
    var use = function(url, code){
        if(code && /\S/.test(code)){
            if(/\.css(?:\?|$)/i.test(url)) {
                var doc = document,
                    node = doc.createElement('style');
                doc.getElementsByTagName("head")[0].appendChild(node);
                if(node.styleSheet) {
                    node.styleSheet.cssText = code;
                } else {
                    node.appendChild(doc.createTextNode(code));
                }
            } else {
                try{
                    code += '//@ sourceURL='+ url;  //for chrome debug
                    ;(window.execScript || function(data){ window['eval'].call(window,data)})(code);
                }catch(e){
                    return false;
                }
            }
        }
        return true;
    }

    var isCombo = function(url){
        var sign = (data.comboSyntax && data.comboSyntax[0]) || '??';
        return url.indexOf(sign) >= 0;
    }

    var splitComboUrl = function(url){
        var syntax = data.comboSyntax || defaultSyntax;
        var arr = url.split(syntax[0]);
        if(arr.length != 2) return url;
        var host = arr[0];
        var urls = arr[1].split(syntax[1]);
        var result = {};
        result.host = host;
        result.files = [];
        for(var i= 0,len = urls.length;i<len;i++){
            result.files.push(urls[i]);
        }
        return result;
    }

    /**
     * Warning: rewrite this function to fit your combo file structure
     * Default: split by define(function(){})
     * @param code
     */
//    var splitCombo = (data.localcache && data.localcache.splitCombo) || function(code, url, files){
//        console.log('fffff');
//        var arr = code.split('define');
//        var result = [];
//        for(var i= 0,len = arr.length;i<len;i++){
//            if(arr[i]){
//                result.push('define'+arr[i]);
//            }
//        }
//        return result;
//    }

    var splitCombo = (data.localcache && data.localcache.splitCombo) || function(code, url, files){
            var splitstr=combosplit;
            var arr = code.split(splitstr);
            var result = [];
            for(var i= 0,len = arr.length;i<len;i++){
                if(arr[i]){
                    result.push(splitstr+arr[i]);
                }
            }
            return result;
        }
    var fetchingList = {};
    var onLoad = function(url){
        var mods = fetchingList[url];
        delete fetchingList[url];
        while ((m = mods.shift())) m.load();
    }

    module.prototype.fetch = function(requestCache){
        var mod = this;
        seajs.emit('fetch',mod);
        var url = mod.requestUri || mod.uri;
        var isComboUrl = isCombo(url);
        var idx = url.lastIndexOf('.'),
            ext = url.substring(idx);
        if(!(ext =='.js' || ext == '.css')){
            fetch.call(mod, requestCache);
            return;
        }
        if(fetchingList[url]){
            fetchingList[url].push(mod);
            return;
        }
        fetchingList[url] = [mod];

        var fallback = function(url){
            delete fetchingList[url];
            fetch.call(mod,requestCache);
        }
        var _fix = function(url){
            var arr = url.split('/js/');
            if(arr.length == 2){
                return arr[1];
            }
            return url;
        };
        var _url=_fix(url);


        if(!isComboUrl && remoteManifest[_url]){
            //in version control
            var cached = storage.get(localfix+remoteManifest[_url]);
            //var cached = storage.get(_url);
            var cachedValidated = validate(url, cached);
            //if(remoteManifest[_url] == localManifest[_url] && cachedValidated){
            if(localManifest[localfix+remoteManifest[_url]]== _url && cachedValidated){
                //cached version is ready to go
                if(!use(url, cached)){
                    fallback(url);
                }else{
                    onLoad(url);
                }
            }else{
                //otherwise, get latest version from network
                fetchAjax(url + '?v='+Math.random().toString(), function(resp){
                    if(resp && validate(url, resp)){
                        if(!use(url, resp)){
                            fallback(url);
                        }else{
                            localManifest[localfix+remoteManifest[_url]] = _url;
                            storage.set(manifestkey, JSON.stringify(localManifest));  //update one by one
                            storage.set(localfix+remoteManifest[_url], resp);
                            onLoad(url);
                            //localManifest[_url] = remoteManifest[_url];
                            //storage.set('manifest', JSON.stringify(localManifest));  //update one by one
                            //storage.set(_url, resp);
                            //onLoad(url);
                        }
                    }else{
                        fallback(url);
                    }
                })
            }
        }else if(isComboUrl){

            //try to find available code cache
            var splited = splitComboUrl(url), needFetchAjax = false;
            for(var i= splited.files.length - 1;i>=0;i--){
                var file = splited.files[i];
                var cached = storage.get(localfix+remoteManifest[file]);
                var cachedValidated = validate(file, cached);
                if(remoteManifest[file]){
                    needFetchAjax = true;
                    if(localManifest[localfix+remoteManifest[file]]== file && cachedValidated) {
                        use(file, cached);
                        splited.files.splice(i,1);  //remove from combo
                    }
                }
            }
            if(splited.files.length == 0){
                onLoad(url);  //all cached
                return;
            }
            // call fetch directly if all combo files are not under version control
            if(!needFetchAjax) {
                fallback(url);
                return;
            }
            var syntax = data.comboSyntax || defaultSyntax,
                comboUrl = splited.host + syntax[0] + splited.files.join(syntax[1]);
            fetchAjax(comboUrl + '?v='+Math.random().toString(), function(resp){
                if(!resp){
                    fallback(url);
                    return;
                }
                var splitedCode = splitCombo(resp, comboUrl, splited.files);
                if(splited.files.length == splitedCode.length){
                    //ensure they are matched with each other
                    for(var i= 0,len = splited.files.length;i<len;i++){
                        var file = splited.files[i];
                        if(!use(file, splitedCode[i])){
                            fallback(url);
                            return;
                        }else{
                            localManifest[localfix+remoteManifest[file]] = file;
                            storage.set(localfix+remoteManifest[file], splitedCode[i]);
                        }
                    }
                    storage.set(manifestkey, JSON.stringify(localManifest));
                    onLoad(url);
                }else{
                    //filenames and codes not matched, fetched code is broken at somewhere.
                    fallback(url);
                }
            })
        }else{
            //localManifest[remoteManifest[_url]] = _url;
            //storage.set('manifest', JSON.stringify(localManifest));  //update one by one
            //storage.set(remoteManifest[_url], resp);
            //not in version control, use default fetch method
            if(localManifest[localfix+remoteManifest[_url]]){
                delete localManifest[localfix+remoteManifest[_url]];
                storage.set(manifestkey, JSON.stringify(localManifest));
                storage.remove(url);
            }
            fallback(url);
        }
    }
});