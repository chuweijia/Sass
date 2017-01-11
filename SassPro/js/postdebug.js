/**
 * Created by Xcar on 2016/10/12.
 */
define("postdebug", ["tpl/postDetails_tpl","lib/lazyload", "lib/cookie","lib/tpl", "lib/zepto", "jxcar"], function (require) {
    var t_pl = require('tpl/postDetails_tpl');
    var tpl = require("lib/tpl");
    var jxcar = require('jxcar');
    var $ = require('lib/zepto');
        require('lib/cookie')
        require('lib/lazyload')

    /*添加deffered支持*/
    jxcar.Deferred= $.Deferred;
    jxcar.debug = false;

    var doc=$('html');


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
        return args; // return the object
    }
    /*
     * data={}
     * 包裹token发送
     * */
    function dispatch(param){
        var  _url=param.url;
        var _formdata=param.data;

        var _param= $.param(_formdata);
        return jxcar.requestToken({"requestUrl":_url+"?"+_param})
            .then(function(data){
                param.data.token=data;
                return $.ajax(param)
            })
    }

    /*
     * data.auth 未编码，但php验证并没有用escape编码
     * $.cookie 为escape编码所以单独给一个setcookie方法
     * */
    function setcookieescape(name, value, options){
        if (typeof value != 'undefined') { // name and value given, set cookie
            options = options ||
                {
                    'domain': document.domain
                };
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 1000));
                }
                else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
            }
            // CAUTION: Needed to parenthesiQZe options.path and options.domain
            // in the following expressions, otherwise they evaluate to undefined
            // in the packed version for some reason...
            var path = options.path ? '; path=' + (options.path) : '';
            var domain = options.domain ? '; domain=' + (options.domain) : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', value, expires, path, domain, secure].join('');
        }
        else { // only name given, get cookie
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = $.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = unescape(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    }
    /*
    * 内容图片处理函数
    * */
    function imgfilter(str){
        var propreg=/([^\s=]+)=[\"\']?([^\s]+)[\"\']/gi;
        var imghold='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII=';

        var img={
        }
        str.replace(propreg,function(e,name,value){
            img[name]=value;
        })
        if(img.src.indexOf('xcar.com.cn/attachments')>0){
            return '<img src="'+imghold+'" class="lazy" data-original="'+img.src+'" />'
        }else{
            return str
        }
    }
    /* 渲染数据 */
    function render(t_pl,rdata){
        var data=rdata.data;
        var imgreg=/<img.*?(?:>|\/>)/gi;
           data.floorInfo.content= data.floorInfo.content.replace(imgreg,imgfilter)

        var list=data.floorList;
        var _list=[];
        for(var i in list){
            var item=list[i];
            item.content=item.content.replace(imgreg,imgfilter);
            _list.push(item)
        }
        data.floorList=_list;

        var strs = tpl(t_pl, rdata);

        $("body").append(strs);
    }
    /* 计算图片尺寸 */
    function renderimg(){

    }
    /*
    * 主题字体大小图更改
    * @param object
    * theme imagemode fontsize
    * theme {
    *           1:'day',
    *           2:'night'
    *       }
    * imagemode {
    *               1:'正常'
    *               2:'小图'
    *           }
    * fontsize {
    *               1:'middle',
    *               2:'big',
    *               3:'small'
    *           }
    * */
    function changeview(param){
        var theme={1:'day',2:'night'};
        var imagemode={1:'正常',2:'小图'};
        var fontsize={1:'middle',2:'big',3:'small'};
        var classlist=[];
        if(param.theme){
            classlist.push(theme[param.theme])
        }
        if(param.imagemode){
            classlist.push(imagemode[param.imagemode])
        }
        if(param.fontsize){
            classlist.push(fontsize[param.fontsize])
        }

        doc.attr('class',classlist.join(' '));

    }
    /* 初始化 */
    jxcar.ready(function(){
        var user={};
        var post={};
        var view={};
        var share={};

        var posturl='http://m-api.xcar.com.cn/bbs/Bbs/detail'
        $.when(
            jxcar.requestCookie(function(data){
                var _cookieoption={
                    expires:365 * 24 * 60 * 60,
                    path:'/',
                    domain:'.xcar.com.cn'
                }
                setcookieescape('bbs_auth',encodeURIComponent(data.auth),_cookieoption);
            }),
            jxcar.requestInitialize()
        ).then(function(rs){
            var args=Array.prototype.slice.call(arguments);

            user={
                uid:args[0].uid,
                uname:args[0].uname,
                auth:args[0].bbsAuth
            }
            view={
                fontsize:args[1].fontSize,
                theme:args[1].theme,
                imagemode:args[1].imageMode
            }
            post={
                id:GetUrlArgs(location.href)['tid'],//args[1].id,
                type:args[1].type,
                isModerator:args[1].isModerator
            }

            var param={
                url:posturl,
                data:{
                    tid:post.id,
                    page:1,
                    type:post.type,
                    network:'wifi',
                    themeType:'IOS'
                }
            }

            changeview(view);
            return dispatch(param)

        }).done(function(rs){
            var rdata=JSON.parse(rs);
            render(t_pl,rdata);
            $('.lazy').lazyload({load:function(self, elements_left, settings){         //effect : "fadeIn"会导致图片二次闪烁所以去掉
                $(this).addClass('loaded').attr('src',$(this).data('original'));
            }})
        })



        /*view事件绑定*/
        jxcar
            .on('requestTheme',function(data){
                if(data)view.theme=data;
                changeview(view);
            })
            .on('requestImageMode',function(data){
                if(data)view.imagemode=data
                changeview(view);
            })
            .on('requestFontSize',function(data){
                if(data)view.fontsize=data
                changeview(view);
            })

        /*分享相关*/


    })


});