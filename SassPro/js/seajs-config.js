;var setdebug=location.href.indexOf('debug') > 0?1:0;
seajs.config({
    localfix:seaconfig.localfix,
    manifestkey:seaconfig.manifestkey,
    combosplit:seaconfig.combosplit,
    comboMap:seaconfig.comboMap

});
//seajs.use('seajs-localcache');
seajs.config({
    debug:setdebug,
    map:seajs.map,
    comboSyntax:seaconfig.comboSyntax,
    base:seabase+'static/'+(setdebug?'assets':'dist/'+resver) +'/js/',
    localcache:{
        timeout: 30000
    }
});
if(setdebug){
    console.log('debug模式js将不采用增量更新，直接script加载所有js的源码');
    (function(){
        var wconsole='http://10.20.26.69:8888/';
        function GetUrlArgs(url) {
            var args = new Object();
            var query = url.substring(1); // get query string
            var pairs = query.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('='); // look for "name=value"
                if (pos == -1) continue; // if not found, skip
                var argname = pairs[i].substring(0, pos); // extract the name
                var value = pairs[i].substring(pos + 1); // extract the value
                value = decodeURIComponent(value); // decode it, if needed
                args[argname] = value; // store as a property
            }
            var ss = args.valueOf(0);
            obj= args;
            return args; // return the object
        }
        var urlArgs=GetUrlArgs(location.search);
        var weinre=urlArgs.hash||'gggg';
        weinre&&(function(e){
            try{
                e.setAttribute("src",wconsole+"target/target-script-min.js#"+weinre);
                document.getElementsByTagName("body")[0].appendChild(e);
               // prompt('address:',wconsole+'client/#'+weinre);
            }catch(e){}
        })(document.createElement("script"))
    })();
}
seajs.use(typeof model!='undefined'?model:'index');