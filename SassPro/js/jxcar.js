/**
 * xcar 组件调用接口，用于web页面调用app内置组件
 * Created by tonwe on 2015/11/2.
 * 支持 cmd引入
 *
 * jxcar类
 *
 * 主动函数与被动事件绑定
 *
 * 支持$.Deferred需要手动设置  xcarjsapi.Deferred=$.Deferred
 */
!function(window,fn){
    "function" == typeof define && (define.cmd) ? define("jxcar",function() {
        return fn(window);
    }) : fn(window)
}(window,function(window){
    var global=window;

    if(global.xcarjsapi){
        return global.xcarjsapi;
    }
    var doc=global.document;
    var isAndroid=/(Android);?[\s\/]+([\d.]+)?/.test(navigator.userAgent);
    var iframeid='__jxcar__iframe__';
    var uniqueId=1;
    var jxcar = global.xcarjsapi = {
        schema:'appxcar://m.xcar.com.cn?',
        version: "2.0",
        jsApiList:[]
    };
    jxcar.Deferred=function(){};
    var callbackname='stableCallBack';
    /* event */
    var events= jxcar.events = {};
    // Bind event
    var on =jxcar.on = function(name, callback) {
        var list = events[name] || (events[name] = []);
        list.push(callback);
        return jxcar
    };
    // Remove event. If `callback` is undefined, remove all callbacks for the
    // event. If `event` and `callback` are both undefined, remove all callbacks
    // for all events
    var off=jxcar.off = function(name, callback) {
        // Remove *all* events
        if (!(name || callback)) {
            events = {};
        }
        var list = events[name];
        if (list) {
            if (callback) {
                for (var i = list.length - 1; i >= 0; i--) {
                    if (list[i] === callback) {
                        list.splice(i, 1)
                    }
                }
            }
            else {
                delete events[name]
            }
        }
        return jxcar
    };
    var emit=jxcar.emit = function(name, data) {
        var list = events[name], fn;
        if (list) {
            list = list.slice();
            while ((fn = list.shift())) {
                fn(data)
            }
        }
        return jxcar
    };
    /*  //event */
    /**
     * 销毁iframe，释放iframe所占用的内存。
     * @param iframe 需要销毁的iframe对象
     */
    function destroyIframe(iframe){
        //把iframe指向空白页面，这样可以释放大部分内存。
        iframe.src = 'about:blank';
        try{
            iframe.contentWindow.document.write('');
        }catch(e){}
        //把iframe从页面移除
        iframe.parentNode.removeChild(iframe);
    }

    jxcar.debug=false;
    /*
     *  向app发送schema请求
     *  采用向页面插入iframe方式执行请求
     *  uniqueId暂时用于重置连接，否则无法重复请求
     *  uniqueId在后续升级中可能用于异步请求标识
     *  调用接口data为参数对象 {"action":"simpleUploader",param:{}}
     *
     *  @param {string} action 组件名 与jsApiList中的名字对应
     *  @param {object} param  组件所需要的参数，示具体组件而定
     *
     * */
    jxcar.jsCallMethod=function(data,cb){
        var schema=jxcar.schema;
        var action=data.action;
        var param =data.param&&encodeURIComponent(JSON.stringify(data.param));
        var _src=schema+'action='+action+(param?'&param='+param:'')+'&unique='+uniqueId+'&callback='+callbackname;
        /*
         * 用户真机测试 不方便调试的情况下 回掉
         * */
        if (typeof jxcar.debug === 'function'){
            jxcar.debug(data);
        }
        if(isAndroid){
            cb&&on(action+'.'+uniqueId,cb);
            console.log(_src);
        }else{
            var msgiframe=doc.createElement('iframe');
            msgiframe.style.display='none';
            msgiframe.id=iframeid+uniqueId;
            msgiframe.src=_src;
            doc.documentElement.appendChild(msgiframe);
            cb&&on(action+'.'+uniqueId,cb);
        }
        uniqueId++;


    };
    /*
     * 接口执行成功后回调 data为返回数据
     * 接口执行成功后将调用
     * 暂时固定callback名称
     * 此方法需要app调用
     * @param {object} json app回传的数据
     * json={
     *  action:@action,         组件名
     *  unique:@unique,         请求标识
     *  data:{}                 回传数据
     * }
     *
     * 是否有unique区分 是否是被动事件
     * */
    global[callbackname]=jxcar.jsCallBack=function(json){
        if (typeof jxcar.debug === 'function'){
            jxcar.debug(json);
        }
        var rs=json;
        var action= rs['action'];
        var uniqueId=rs['unique'];

        if(uniqueId){
            emit(action+'.'+uniqueId,rs['data']);
            off(action+'.'+uniqueId);
        }else{
            emit(action,rs['data']);
        }
        /*销毁iframe*/
        var _iframe=document.getElementById(iframeid+uniqueId);
        _iframe&&destroyIframe(_iframe)

        //emit(action+'.'+uniqueId,rs['data']);

    };
    /*
     * 判断是否支持 xcarjsapi 因为ua与xcarjsapi同时上线所以暂时以appxcar判断
     * */
    jxcar.isSupport=function(){
        return window.navigator.userAgent.indexOf('appxcar') > -1;
    };
    /*
     * 整个xcarjsapi都是以异步方式进行，调用组件需要等待xcarjsapi准备完毕
     * ready为所有操作的入口
     *
     * @param {function} cb 回调函数，组件准备载入完毕将调用，在cb中执行组件调用方法
     *
     * */
    jxcar.ready=function(cb){
        var action='register';
        jxcar.jsCallMethod({action:action},function(data){
            jxcar.jsApiList=data;
            for(var index in data){
                var api=data[index];
                jxcar[api]=function(_api){
                    return function(){
                        var dtd = jxcar.Deferred();
                        var args=Array.prototype.slice.call(arguments),param,cb;

                        if(typeof args[0]==='function'){
                            param={};
                            cb=args[0]
                        }else{
                            param=args[0];
                            cb=args[1]
                        }

                        var _action=_api;

                        jxcar.jsCallMethod({action:_action,param:param},function(data){
                            cb&&cb(data);
                            dtd&&dtd.resolve(data)
                        });
                        if(dtd){
                            return dtd.promise();
                        }
                    };
                }(api);
            }
            cb&&cb(data);
        });
    };

    return jxcar;
});