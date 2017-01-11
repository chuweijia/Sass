/**
 * Created by tonwe on 2016/11/8.
 */
define("newsDetails", ["tpl/newsDetails_tpl", "lib/lazyload", "lib/cookie", "lib/tpl", "lib/zepto", "jxcar"], function (require) {
    var t_pl = require('tpl/newsDetails_tpl');
    var tpl = require("lib/tpl");
    var jxcar = require('jxcar');
    var $ = require('lib/zepto');
    require('lib/cookie')
    require('lib/lazyload')

    /*添加deffered支持*/
    jxcar.Deferred = $.Deferred;


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

        var reclist={};
        var posturl = '//m-api.xcar.com.cn/cms/NewsList/detail';


        /*
         * data={}
         * 包裹token发送
         * */
        function dispatch(param) {
            var _url = param.url;
            var _formdata = param.data;
            var _deviceData = deviceConfig;
            _formdata._t=+new Date();
            var _param = $.param(_formdata);
            return jxcar.requestToken({"requestUrl": _url + "?" + _param})
                .then(function (data) {
                    param.headers={
                        token:data
                    }
                    $.extend(param.headers, _deviceData);
                    return $.ajax(param)
                })
        }
        /*点赞函数*/
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
                            // $praise = $('li[data-id="'+commentId+'"]').find('.like');
                            // num = +$praiseNum.html()||0;
                            // num++;
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
            var args = Array.prototype.slice.call(arguments);
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
         eachConcern:2      //stu=3    已关注对方   互相关注
         }*/
        function follow(intention) {
            var foll_Stu = {
                0: {
                    class: 'addConcern',
                    text: '加关注'
                },
                1: {
                    class: 'cancelConcern',
                    text: '已关注'
                },
                2: {
                    class: 'tickConcern',
                    text: '加关注'
                },
                3: {
                    class: 'eachConcern',
                    text: '相互关注'
                }
            }

            return jxcar.requestFollow({
                userId: news.authorId,
                intention: intention
            }, function (data) {

            }).then(function (data) {
                if (data && data.result) {
                    var state = data.state;
                    $('.avatar-concern')
                        .attr('class', 'avatar-concern ' + foll_Stu[state]['class'])
                        .html('<i class="ico"></i>' + foll_Stu[state]['text']);
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
                taskFinished:(news.taskDes != undefined)?true:false,
                taskDes:news.taskDes,
                taskReward:news.taskReward,
                message: news.errorMsg,
                currentPage: news.page,
                totalPage: news.pageCount,
                isModerator: news.isModerator,  //版务
                isEssence: news.isEssence,
                summary:news.summary||[],
                webLink:share.linkUrl,

                commentCount:news.commentCount,
                isFavorite:news.isCollected == 1 ? true : false
            })
            console.log('3');
            if (news.page) {
                gopage(news.page)
            }

            /*曝光*/
            setTimeout(function(){
                for(var i in reclist){
                    var rec=reclist[i];
                    if(rec.exposureUrl){
                        var exps=rec.exposureUrl;
                        for(var j in exps){
                            var _img=new Image();
                            _img.src=exps[j];
                        }
                    }
                }
            },500)

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
                img.original = img.src + '?imageView/0/w/280';
            }
            var imghold = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='" + (img.width||4) + "' height='" + (img.height||3) + "' />";
            if (img.src.indexOf('xcar.com.cn') > 0||img.src.indexOf('xcarimg.com')) {
                return '<img data-desc="'+img.xlongdesc+'" src="' + imghold + '" class="lazy inimg" data-src="' + img.src + '" data-original="' + img.original + '" />'
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


            var list = data.contentList;
            var _list = [];
            for (var i in list) {
                var item = list[i];
                item.content = item.content.replace(imgreg, imgfilter);
                item.content = item.content.replace(videoreg,videofilter);
                _list.push(item)
            }
            data.contentList = _list;
            var strs = tpl(t_pl, rdata);

            $("body").html(strs);
            console.log(2);
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
                $('.master img.lazy:not(.loaded)').each(function () {
                    if ($(this).hasClass('outimg'))return;
                    var _src = $(this).data('src');
                    if (view.imagemode == 2)
                        $(this).data('original', _src + '?imageView/0/w/280');
                    else
                        $(this).data('original', _src)
                })
            }
            if (view.fontsize) {
                classlist.push(fontsize[param.fontsize])
            }
            doc.attr('class', classlist.join(' '));

        }
        function apievent(){
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
                    if (shareType) {
                        toshare(shareType);
                    }
                })
                .on('requestPage',gopage)
        }
        function domevent() {
            var doc = document;
            var win = window;
            var root = $('body');
            /*分享相关*/

            root.on('tap', '.master .inimg,.master .outimg', function () {
                    var src = $(this).data('src');
                    var desc=$(this).data('desc')
                    src && jxcar.requestImages({
                        imageUrl: src,
                        note:desc
                    })
                })

                .on('tap','.reply .insert-img img',function (e) {
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
                    follow(intention)
                })
                /*点赞系列*/
                .on('click', '.thumb', function () {
                    if ($(this).hasClass('thumbed'))return;
                    var _id=$(this).parents('li').data('id');
                    praise();
                    // if (user.uid) {
                    //     // console.log(_id); 
                    //     console.log(user.uid);
                    //     praise(_id)

                    // } else {
                    //     jxcar.requestLogin({}, changeuser)
                    // }
                })
                // .on('click', '.thumb', function () { 
                //     if ($(this).hasClass('thumbed'))return;
                //     if (user.uid) {
                //         praise()
                //     } else {
                //         jxcar.requestLogin({}, changeuser)
                //         //.then(praise)
                //     }

                // })
                /*评论点赞*/
                .on('click','.like',function(){
                    if ($(this).hasClass('like-in'))return;
                    var _id=$(this).parents('li').data('id');
                    // if (user.uid) {
                    //     praise(_id)

                    // } else {
                    //     jxcar.requestLogin({}, changeuser)
                    // }
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
                /*评分*/
                .on('click', '.btn-grade', function () {
                    var _floorId;
                    var that = this;

                    if (user.uid) {

                    } else {
                        jxcar.requestLogin({}, changeuser);
                        return false
                    }

                    if ($(that).hasClass('scoreded'))return;

                    $('.showMore').removeClass('showMore').addClass('hideMore');
                    if ($(this).parents("li")[0]) {
                        _floorId = +$(this).parents("li").attr('data-floorId')
                    } else {
                        _floorId = +$('.master').attr('data-floorId');
                    }
                    jxcar.requestGrade({
                        "floorId": _floorId
                    }).then(function (data) {
                        if (data.result) {
                            var _moper = $(that).parents('.master-operate');
                            var _scorebox = _moper.find('.score');
                            if (!_scorebox[0]) {
                                _scorebox = $('<div class="score"></div>');
                                _scorebox.prependTo(_moper)
                            }
                            _scorebox.html('评分' + (data.grade > 0 ? ('+' + data.grade) : ('-' + data.grade)));
                            $(that).addClass('scoreded').html('已评分')
                        }
                    })
                })
                /*举报*/
                .on('click', '.btn-report', function () {
                    if (user.uid) {

                    } else {
                        jxcar.requestLogin({}, changeuser);
                        return false
                    }
                    var _floorId;
                    var that = this;
                    if ($(that).hasClass('scoreded'))return;

                    $('.showMore').removeClass('showMore').addClass('hideMore');
                    if ($(this).parents("li")[0]) {
                        _floorId = +$(this).parents("li").attr('data-floorId')
                    } else {
                        _floorId = +$('.master').attr('data-floorId');
                    }
                    jxcar.requestReport({
                        "floorId": _floorId
                    }).then(function (data) {
                        if (data) {
                            $(that).addClass('scoreded').html('已举报')
                        }
                    })
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

                /*点击活动报名*/
                .on('click', '.note .js-apply',function () {
                    if($(this).hasClass("disable")) return;
                    var that=this;
                    if (!user.uid) {
                        jxcar.requestLogin({}, changeuser);
                        return false;
                    }
                    jxcar.requestApply({
                        count:+$(that).parents(".note").attr("data-activity-limit"),
                        needTelephone:!!(+$(that).parents(".note").attr("data-activity-need-phone"))
                    }).then(function (data) {
                        if(data.result){
                            $(".js-activity-count").text(data.count+"人参加");
                            $(that).addClass("disable").text("报名审核中");
                        }
                    })
                })
                /*点击投票*/
                .on('click','.note .js-vote',function () {
                    //置灰不可点击
                    if($(this).hasClass("disable")) return;
                    if (!user.uid) {
                        jxcar.requestLogin({}, changeuser);
                        return false;
                    }
                    //按钮可点击，文案为“已投票，分享给好友”，此时调用app分享面板
                    if($(this).hasClass("js-app-share")){
                        toshare(0);
                        return;
                    }else{
                        //未选择任何投票选项，提示“请选择投票选项”
                        if(!$(".vote-item input:checked").size()){
                            console.log("请选择投票选项");
                            return;
                        }
                    }
                    var options = '',_$list = $(".js-vote-list li");
                    _$list.each(function () {
                        if($(this).find("input").prop("checked"))
                            options += "_"+$(this).attr("data-optionId");
                    });
                    options = options.substr(1);
                    var _param = {
                        type:'post',
                        url : portUrl+'doPoll',
                        data :{
                            tid : thread.id,
                            option : options
                        }
                    };
                    dispatch(_param)
                        .done(function (res) {
                            res = JSON.parse(res);//注意：此处为php直接返回接口，必须转成JSON格式使用，跟其他接口不同
                            if(res.data.errorCode == 1) {
                                renderVote(res.data.voteTotal,res.data.voteList);
                                console.log("投票成功");
                            }
                        })
                        .fail(function (res) {
                        });
                })

                .on('click','.more-bt a',function(){
                    jxcar.requestComment({commentId:0})
                })

                /*点击重载*/
                .on('click','.offline',function(){
                    location.reload()
                })

                .on('tap','.vcontent',function(){
                    var youku=$(this).data('youku');
                    var qiniu=$(this).data('qiniu');
                    var type=!!youku?1:2;
                    var id=youku||qiniu;

                    location.href='appxcar://m.xcar.com.cn.video?params={"type":'+type+',"id":"'+id+'"}'
                })
        }
        function datafail(){
            jxcar.onLoadFailure();
            con.removeClass('newsload').addClass('offline').html('<section class="reload"><div><a href="javascript:"></a><p>加载失败了,点击重试</p></div></section>');
            jxcar.showMessage&&jxcar.showMessage({result:false,message:"加载失败，请检查网络后重试"});
        }
        $.when(
            jxcar.requestCookie(changeuser),
            jxcar.requestInitialize(),
            jxcar.requestOthers()
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
                page:args[1].page,
                t:1

            }
            deviceConfig = args[2];
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
            var rdata = JSON.parse(rs);

            if (rdata.data.shareInfo) {
                $.extend(share, {
                    title: rdata.data.shareInfo.title,
                    content: rdata.data.shareInfo.desc||"点击查看详情",
                    imageUrl: rdata.data.shareInfo.imageUrl,
                    linkUrl: rdata.data.shareInfo.webLink
                })
            }
            if(rdata.data.titleList){
                news.summary=[];

                for(var i in rdata.data.titleList){
                    if(Object.prototype.hasOwnProperty.call(rdata.data.titleList,i)){
                        news.summary.push({
                            id:i,
                            title:rdata.data.titleList[i]
                        })
                    }

                }
            }
            if(rdata.data.recommendList){
                reclist=rdata.data.recommendList;
            }
            news.authorId=rdata.data.newsInfo.authorUid;


            $.extend(news,rdata.data.newsInfo);

            render(t_pl, rdata);
            renderview()

            $('.vcontent').attr('data-original','//m-js.xcar.com.cn/xcarapp7/static/pic/'+(view.theme?'videoholder-day.png':'videoholder-night.png'))

            setTimeout(function(){
                $('.lazy').lazyload({
                    load: function (self, elements_left, settings) {         //effect : "fadeIn"会导致图片二次闪烁所以去掉

                        $(this).css({'background-size':'cover','-webkit-background-size':'cover','background-position': 'center','background-repeat':'no-repeat'}).addClass('loaded').attr('src', $(this).data('original'));
                    }
                }).on('error',function(){
                    if($(this).hasClass('face-wrap')){
                        $(this)
                            .css({'background-image':'url(//m-js.xcar.com.cn/xcarapp7/static/pic/face_default.png)','background-size':'100% auto','-webkit-background-size':'100% auto'})
                            .off('error')
                    }
                })
            },500)

        }).fail(datafail).always(domevent);
        apievent();

    });
})