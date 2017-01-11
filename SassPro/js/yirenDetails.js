/**
 * Created by tonwe on 2016/11/8.
 */
define("yirenDetails", ["tpl/yirenDetails_tpl", "lib/lazyload", "lib/cookie", "lib/tpl", "lib/zepto", "jxcar"], function (require) {
    var t_pl = require('tpl/yirenDetails_tpl');
    var tpl = require("lib/tpl");
    var jxcar = require('jxcar');
    var $ = require('lib/zepto');
    require('lib/cookie')
    require('lib/lazyload')

    /*添加deffered支持*/
    jxcar.Deferred = $.Deferred;
    jxcar.debug = function (data) {
        console.log(data)
    };

    var doc = $('html');
    var win = $(window);
    var con=$('.content');
    window.$ = $;


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
     * data.auth 未编码，但php验证并没有用escape编码
     * $.cookie 为escape编码所以单独给一个setcookie方法
     * */
    function setcookieescape(name, value, options) {
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

    /*初始化*/
    jxcar.ready(function(){
        jxcar.onLoadStart();
        var user = {};
        var news = {};
        var view = {};
        var share = {};

        var posturl = '//m-api.xcar.com.cn/cms/isay/detail';

        /*
         * data={}
         * 包裹token发送
         * */
        function dispatch(param) {
            var _url = param.url;
            var _formdata = param.data;
            _formdata._t=+new Date();
            var _param = $.param(_formdata);
            return jxcar.requestToken({"requestUrl": _url + "?" + _param})
                .then(function (data) {
                    //param.data.token = data;
                    param.headers={
                        token:data//,
                        //iphonecookie:user.cookie
                    }
                    return $.ajax(param)
                })
        }
        /*点赞函数*/
        function praise(commentId) {
            var _param={
                userId: user.uid
            };
            if(commentId){
                _param.commentId=commentId;
            }
            return jxcar.requestPraise(_param)
                .then(function (data) {
                    if (!!data) {
                        var $praise,num;
                        if(commentId){
                            // $praiseNum = $('li[data-id="'+commentId+'"]').find('.like span');
                            // num = +$praiseNum.html()||0;
                            // num++;
                            // $praise = $('li[data-id="'+commentId+'"]').find('.like');
                            // $praise.addClass('like-in like-in-plus');
                            // if (num) {
                            //     $praiseNum.html(num)
                            // }
                            $praise = $('li[data-id="'+commentId+'"]').find('.like');
                            $praiseNum = $('li[data-id="'+commentId+'"]').find('.like span');
                            num = +$praiseNum.html();
                            if(num < 99999){//99998
                                num++;
                            }
                            else{ //99999 99999+
                                num = '99999+';
                            }
                            $praise.addClass('like-in like-in-plus');//动画
                            $praiseNum.html(num);

                        }else{
                            // $praise = $('.master-share .thumb');
                            // num = +$praise.siblings('span').html()||0;
                            // num++;
                            // $praise.addClass('thumbed-plus thumbed');
                            // if (num) {
                            //     $praise.siblings('span').html(num)
                            // }
                            $praise = $('.master-share .thumb');
                            if(news.praiseCount > 99999 || news.praiseCount == 99999){
                                num  = '99999+';
                            }
                            else{
                                num = $praise.siblings('span').html();
                                num++;
                            }
                            $praise.addClass('thumbed-plus thumbed');//动画
                            $praise.siblings('span').html(num);
                        }

                    }
                })
        }

        /*分享*/
        function toshare() {
            var args = Array.prototype.slice.call(arguments);//NodeList转数组?
            var _param = {hasContent: true};
            if (typeof args[0] === 'object') {
                _param = $.extend(_param, args[0])
            } else {
                _param.shareType = args[0]
                $.extend(_param, share)
            }
            console.log(_param);
            jxcar.requestShare(_param)
                .then(function () {
                    
                })
        }

        /*精华修改*/
        function essence(data) {
            var _title = $('.master-title');
            console.log(data);
            if (data == 1) {
                _title.attr('class', 'master-title essence').attr('data-title', '精华')
            } else if (data == 2) {
                _title.attr('class', 'master-title').attr('data-title', '')
            }
        }

        /*举报*/
        function report() {

        }

        /*评分*/
        function grade(data) {
            if (data.result) {

            }
        }

        /*关注
         {
         addConcern:1,      //stu=0    未关注对方   没有任何关注
         cancelConcern:2,   //stu=1    已关注对方   对方没有关注我
         tickConcern:1,     //stu=2    未关注对方   对方关注我
         eachConcern:2      //stu=3    已关注对方   相互关注
         }*/
        function follow(intention) {
            var foll_Stu = {
                0: {
                    class: 'addConcern',
                    text: '关注'
                },
                1: {
                    class: 'cancelConcern',
                    text: '已关注'
                },
                2: {
                    class: 'addConcern',
                    text: '关注'
                },
                3: {
                    class: 'eachConcern',
                    text: '相互关注'
                }
            }

            return jxcar.requestFollow({
                authorId: +news.authorId,
                intention: +intention
            }, function (data) {

            }).then(function (data) {
                if (data && data.result) {
                    var state = data.state;
                    console.log(data);
                    console.log(state);
                    $('.avatar-concern')
                        .attr('class', 'avatar-concern ' + foll_Stu[state]['class'])
                        .html('<span>' + foll_Stu[state]['text'] + '</span>');
                }
            })
        }


        /*修改用户cookie信息*/
        function changeuser(data) {
            if (!data||!data.uid || !data.auth) {
                data = {
                    uid: 0,
                    uname: '',
                    auth: '',
                    cookie: ''
                }
                //return false;
            }
            var _cookieoption = {
                expires: 365 * 24 * 60 * 60,
                path: '/',
                domain: '.xcar.com.cn'
            }
            user = {
                uid: +data.uid,
                uname: data.uname,
                auth: data.auth,
                cookie: data.cookie.replace('iphonecookie=', '') /*明显坑人 这都是毒*/
            }
            //setcookieescape('bbs_auth', encodeURIComponent(user.auth), _cookieoption);
            setcookieescape('iphonecookie', encodeURIComponent(user.cookie), _cookieoption);
        }
        /*定位*/
        function gopage(page){
            if(typeof page!=='undefined'){
                window.scrollTo(0, doc.find('div[data-page="' + page + '"]').offset().top)
            }
        }
        /*初始化view*/
        function renderview() {
            var special = {
                1: '抱歉，您浏览的帖子已归档，暂时无法回复',
                2: '抱歉，您浏览的帖子已关闭，暂时无法回复',
                3: '抱歉，您浏览的帖子已删除，暂时无法回复',
                4: '抱歉，您现在的权限无法浏览本帖'
            }
            jxcar.onLoadSuccess({
                isOperateEnable: true,
                // message: news.errorMsg,
                // currentPage: news.page,
                // totalPage: news.pageCount,
                // isModerator: news.isModerator,  //版务
                // isFavorite: news.isFavorite,   //收藏
                // isEssence: news.isEssence,
                // summary:news.summary||[],
                webLink:share.linkUrl,
                isFavorite:news.isCollected == 1?true:false,
                commentCount:news.commentCount
            })

            if (news.page) {
                gopage(news.page)
            }

        }

        /*
         * 内容图片处理函数
         * */
        function imgfilter(str) {
            var propreg = /([^\s=]+)=[\"\']?([^\s]+)[\"\']/gi;
            var img = {}
            str.replace(propreg, function (e, name, value) {
                img[name] = value;
            })
            if (!img.src) {
                return str
            }
            img.original = img.src;
            if (view.imagemode == 2) {
                img.original = img.src
            }
            var imghold = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='" + (img.width||4) + "' height='" + (img.height||3) + "' />";
            if (img.src.indexOf('xcar.com.cn') > 0||img.src.indexOf('xcarimg.com')) {
                return '<img data-desc="'+img.xlongdesc+'" src="' + imghold + '"  class="lazy inimg" data-src="' + img.src + '" data-original="' + img.original + '" />'
            } else if (img.src.indexOf('/static/images/') > 0) {
                return '<img data-desc="'+img.xlongdesc+'" src="' + img.src + '" style="display: inline-block;width: .2rem;height: .2rem;vertical-align: text-top;" class="smillimg" />'
            } else {
                return '<img data-desc="'+img.xlongdesc+'" src="' + img.src + '" style="width: auto" class="lazy outimg" data-src="' + img.src + '" data-original="' + img.original + '" />'
            }
        }
        /*
         * 视频处理
         * */
        function videofilter(str) {
            var propreg = /([^\s=]+)=[\"\']?([^\s]+)[\"\']/gi;
            var video = {}
            str.replace(propreg, function (e, name, value) {
                video[name] = value;
            })

            return '<div class="vcontent lazy" data-youku="'+video['data-youku']+'" data-qiniu="'+video['data-qiniu']+'" data-original=""><img src="data:image/svg+xml;utf8,&lt;svg xmlns=\'http://www.w3.org/2000/svg\' width=\'3\' height=\'2\' &gt;&lt;/svg&gt;"></div>';
        }
        /* 渲染数据 */
        function render(t_pl, rdata) {
            var data = rdata.data;
            var imgreg = /<img.*?(?:>|\/>)/gi;
            var videoreg = /<div class="vcontent lazy" data-youku="[^"]*" data-qiniu="[^"]*" data-original="[^"]*">([\s\S]+?)<\/div>/gi;


            data.newsInfo.content = data.newsInfo.content.replace(imgreg, imgfilter);
            data.newsInfo.content = data.newsInfo.content.replace(videoreg, videofilter);

            var strs = tpl(t_pl, rdata);

            $("body").html(strs);
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
        function changeview(param) {
            console.log('enter changeview')
            console.log(view.imagemode)
            var theme = {1: 'day', 2: 'night'};
            var imagemode = {1: 'imgBig', 2: 'imgSmall'};
            var fontsize = {1: 'fontSmall', 2: 'fontMiddle', 3: 'fontBig'};
            var classlist = [];
            $.extend(view, param)
            if (view.theme) {
                classlist.push(theme[param.theme])
            }
            if (view.imagemode) {
                classlist.push(imagemode[param.imagemode]);
                $('img.lazy:not(.loaded)').each(function () {
                    if ($(this).hasClass('outimg'))return;
                    var _src = $(this).data('src');
                    if (view.imagemode == 2){
                        $(this).data('original', _src)
                        console.log($(this));
                    }
                    else{
                        $(this).data('original', _src)
                    }
                })
            }
            if (view.fontsize) {
                classlist.push(fontsize[param.fontsize])
            }
            doc.attr('class', classlist.join(' '));

        }

        function domevent(){
            var doc = document;
            var root = $('body');
            /*分享相关*/

            root.on('tap', '.master .inimg,.master .outimg', function () {
                    var src = $(this).data('src')
                    src && jxcar.requestImages({
                        imageUrl: src
                    })
                })
                .on('tap', '.reply .inimg,.reply .outimg', function () {
                    var src = $(this).data('src')
                    var parent = $(this).parents('li');
                    var author = parent.data('userid'); //最新评论 和热评

                    if(author==news.authorId){
                        if($(this).parents('.reply-userContent')[0]){
                            src && jxcar.requestImages({
                                imageUrl: src
                            })
                            return true;
                        }
                    }
                    src && jxcar.requestSingleImage({
                        imageUrl: src,
                        note:'假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注假的图注'
                    })

                    // src && jxcar.requestImages({
                    //     imageUrl: src
                    // })
                })
                .on('click','.comment-mode .insert-img img',function (e) {
                    var src = $(this).data('src')||$(this).attr('src')
                    src && jxcar.requestSingleImage({
                        imageUrl: src
                    })
                })

                .on('click', '.avatar-concern', function () {
                    var intention;     //用户行为意图   1 加   2 取消
                    if ($(this).hasClass('addConcern') || $(this).hasClass('tickConcern')) {
                        intention = 1
                    } else if ($(this).hasClass('cancelConcern') || $(this).hasClass('eachConcern')) {
                        intention = 2
                    }
                    if (user.uid) {
                        follow(intention)
                    } else {
                        //jxcar.requestLogin({}, changeuser);
                        follow(intention)
                    }
                })
                /*点赞系列*/
                .on('click', '.thumb', function () {
                    if ($(this).hasClass('thumbed'))return;
                    praise()
                })
                /*评论点赞*/
                .on('click','.like',function(){
                    if ($(this).hasClass('like-in'))return;
                    var _id=$(this).parents('li').data('id');
                    // if (user.uid) {
                    //     praise(_id)

                    // } else {
                    //     jxcar.requestLogin({}, changeuser)
                    // }
                    console.log(_id);
                    praise(_id);
                })

                /*回复评论*/
                .on('click', '.enter', function () {
                    var _param={};
                    var $com=$(this).parents('li');
                    _param.userId=$com.data('userid');
                    _param.userName=$com.data('username');
                    _param.commentId=$com.data('id');
                    _param.comment=$com.find('.reply-userContent').html();

                    if(_param.userId&&_param.userName&&_param.commentId){
                        jxcar.requestComment(_param)
                    }
                })
              
               
                /*更多*/
                .on('click', '.btn-more', function () {
                    var _mcom = $(this).siblings('.more-parent');
                    var _isshow = _mcom.hasClass('showMore')
                    $('.showMore').removeClass('showMore').addClass('hideMore')
                    if (!_isshow) {
                        _mcom.removeClass('hideMore').addClass('showMore')
                    }
                })

                /*点击用户信息*/
                /*.on('click', '.master-name,.js-avatar', function (e) {
                 var _parent = $(this).parents("li");
                 var _uid, _uname;
                 if (!!_parent[0]) {
                 _uid = _parent.attr('data-authorid');
                 _uname = _parent.attr('data-authorid');
                 } else {
                 _uid = thread.authorId;
                 _uname = thread.authorName;
                 }
                 jxcar.requestPersonalCenter({
                 userId: +_uid,
                 userName: _uname
                 })
                 })*/
                /*点击分享*/
                .on('click', '.master-share .friend,.master-share .sina,.master-share .wechat', function () {
                    var _type;

                    if ($(this).hasClass('friend')) {
                        _type = 2
                    }
                    else if ($(this).hasClass('sina')) {
                        _type = 5
                    }
                    else if ($(this).hasClass('wechat')) {
                        _type = 1
                    }
                    toshare(_type)

                })

                /*点击重载*/
                .on('click','.more-bt a',function(){
                    jxcar.requestComment({commentId:0})
                })
                .on('click','.offline',function(){
                    console.log('location.reload()');
                    location.reload();
                })
                .on('tap','.vcontent',function(){
                    var youku=$(this).data('youku');
                    var qiniu=$(this).data('qiniu');
                    var type=!!youku?1:2;
                    var id=youku||qiniu;

                    location.href='appxcar://m.xcar.com.cn.video?params={"type":'+type+',"id":"'+id+'"}'
                })
        }
        function apievent() {
            var doc = document;
            var win = window;
            var root = $('body');
            /*view事件绑定*/
            jxcar
                .on('requestTheme', function (data) {
                    if (data)view.theme = data;
                    changeview(view);
                })
                .on('requestImageMode', function (data) {
                    if (data)view.imagemode = data
                    changeview(view);
                })
                .on('requestFontSize', function (data) {
                    if (data)view.fontsize = data
                    changeview(view);
                })
                .on('requestEssence', essence)
                .on('requestShare', function (data) {

                    var shareType = data; 
                    console.log(shareType);
                    if (shareType) {
                        toshare(shareType);
                    }
                })
                .on('requestPage',gopage)
                .on('tap','.vcontent',function(){
                    var youku=$(this).data('youku');
                    var qiniu=$(this).data('qiniu');
                    var type=!!youku?1:2;
                    var id=youku||qiniu;

                    location.href='appxcar://m.xcar.com.cn.video?params={"type":'+type+',"id":"'+id+'"}'
                })


        }
        function datafail(){
            jxcar.onLoadFailure()
            con.removeClass('load').addClass('offline').html('<section class="reload"><div><a href="javascript:"></a><p>加载失败了,点击重试</p></div></section>')
            jxcar.showMessage&&jxcar.showMessage({result:false,message:"加载失败，请检查网络后重试"});
        }
        $.when(
            jxcar.requestCookie(changeuser),
            jxcar.requestInitialize()
        ).then(function (rs) {

            var args = Array.prototype.slice.call(arguments);
            view = {
                fontsize: args[1].fontSize || 1,
                theme: args[1].theme > 2 ? 1 : args[1].theme,
                imagemode: args[1].imageMode || 1,
                anchor: args[1].anchor || 'start',

            }
            news = {
                id: GetUrlArgs(location.href)['tid'] || args[1].id,//args[1].id,
                page:args[1].page

            }

            var param = {
                url: posturl,
                data: {
                    newsId: news.id,

                },
                timeout:20000
            }

            changeview(view);

            return dispatch(param)

        }).done(function (rs) {

            var rdata;
            rdata= JSON.parse(rs);
            if (rdata.data.shareInfo) {
                $.extend(share, {
                    title: rdata.data.shareInfo.title,
                    content: rdata.data.shareInfo.desc||"点击查看详情",
                    imageUrl: rdata.data.shareInfo.imageUrl,
                    linkUrl: rdata.data.shareInfo.webLink
                })
            }

            news.authorId=rdata.data.newsInfo.authorId;

            $.extend(news,rdata.data.newsInfo);
            console.log('合并extend');
            console.log(news);
            render(t_pl, rdata);
            renderview()
            $('.vcontent').attr('data-original','//m-js.xcar.com.cn/xcarapp7/static/pic/'+(view.theme?'videoholder-day.png':'videoholder-night.png'));
            $('.lazy').lazyload({
                load: function (self, elements_left, settings) {         //effect : "fadeIn"会导致图片二次闪烁所以去掉
                    
                    $(this).addClass('loaded').attr('src', $(this).data('original'));
                }
            }).on('error',function(){
                if($(this).hasClass('face-wrap')){
                    $(this)
                        .css({'background-image':'url(//m-js.xcar.com.cn/xcarapp7/static/pic/face_default.png)','background-size':'100% auto','-webkit-background-size':'100% auto'})
                        .off('error')
                }
            })
            try{


            }catch(e){
                console.log(e)
                datafail();
            }
        }).fail(datafail).always(domevent);
        apievent();


    });
})