define("postDetails", ["tpl/postDetails_tpl", "lib/lazyload", "lib/cookie", "lib/tpl", "lib/zepto", "jxcar"], function (require) {
    var t_pl = require('tpl/postDetails_tpl');
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


    /* 计算图片尺寸 */
    function renderimg() {

    }

    /* 初始化 */
    jxcar.ready(function () {
        jxcar.onLoadStart();
        var user = {};
        var thread = {};
        var view = {};
        var share = {};
        var deviceConfig={};
        var city={};
        var voteType={};
        var adinfo={};
        var posturl = '//m-api.xcar.com.cn/bbs/Bbs/detail';
        var portUrl = '//m-api.xcar.com.cn/bbs/Posts/';

        /*
         * data={}
         * 包裹token发送
         * */
        function dispatch(param) {
            var _url = param.url;
            var _formdata = param.data;
            var _deviceData = deviceConfig;
            _formdata.t=+new Date();
            var _param = $.param(_formdata);
            return jxcar.requestToken({"requestUrl": _url + "?" + _param})
                .then(function (data) {
                    param.headers={
                        token:data
                    }
                    $.extend(param.headers, _deviceData)
                   
                    return $.ajax(param)
                })
        }
        /*点赞函数*/
        function praise() {
            return jxcar.requestPraise({
                userId: user.uid//为0也能去执行..
            }).then(function (data) {
                console.log(data);

                if(!!data) {
                    var $praise,num;
                    $praise = $('.master-share .thumb');
                    // var $praise = $('.master-share .thumb');
                    // var num = +$praise.siblings('span').html();
                    // num++;
                    // $praise.addClass('thumbed-plus thumbed'); //为了不发请求 而是转为前端拦截验证已赞
                    // if (num) {
                    //     $praise.siblings('span').html(num)
                    // }
                    if(thread.praiseCount > 99999 || thread.praiseCount == 99999){
                        num  = '99999+';
                    }
                    else{
                        num = $praise.siblings('span').html();
                        num++;
                    }
                    $praise.addClass('thumbed-plus thumbed');//动画
                    $praise.siblings('span').html(num);
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
                    // jxcar.showMessage({
                    //     result:!0,
                    //     message:'分享回掉'
                    // })
                })
        }

        /*精华修改*/
        function essence(data) {
            var _title = $('.master-title');
            var _essence = _title.find('.essence'); 
            if (data == 1) {
                var _d = "border:solid 1px #ff5252;color:#ff5252;";
                var _n = "border:solid 1px #ec4141;color:#ec4141;";
                var _style = $('html').hasClass('day')?_d:_n;
                var _tpl = '<em class="essence"'+'style="'+_style+'">'+'<span>'+'精华'+'</span>'+'</em>';
                _title.append(_tpl);
            } else if (data == 2) {
                _essence.remove();
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
            // var foll_Stu = {
            //     0: {
            //         class: 'addConcern',
            //         text: '加关注'
            //     },
            //     1: {
            //         class: 'cancelConcern',
            //         text: '已关注'
            //     },
            //     2: {
            //         class: 'tickConcern',
            //         text: '关注'
            //     },
            //     3: {
            //         class: 'eachConcern',
            //         text: '相互关注'
            //     }
            // }
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
                userId: thread.userInfo.authorId,
                intention: intention
            }, function (data) {

            }).then(function (data) {
                if (data && data.result) {
                    var state = data.state;
                    console.log(state);
                    $('.avatar-concern')
                        .attr('class', 'avatar-concern ' + foll_Stu[state]['class'])
                        .html('<span>' + foll_Stu[state]['text'] + '</span>');
                }
            })
        }

        /*修改用户cookie信息*/
        function changeuser(data) {
            console.log(data);
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
            console.log(user.uid);
        }

        /*初始化view*/
        function renderview() {
            var special = {
                1: '抱歉，您浏览的帖子已归档，暂时无法回复',
                2: '抱歉，您浏览的帖子已关闭，暂时无法回复',
                3: '抱歉，您浏览的帖子已删除，暂时无法回复',
                4: '抱歉，您现在的权限无法浏览本帖'
            }
            console.log(thread);
            var special = [1,2,3];
            jxcar.onLoadSuccess({
                isOperateEnable: special.indexOf(thread.specialType)> -1 ? false : true,
                message: thread.errorMsg,
                currentPage: thread.page,
                totalPage: thread.pageCount,
                isModerator: thread.isModerator,  //版务
                isFavorite: thread.isFavorite,   //收藏
                isEssence: thread.isEssence,
                title:thread.title,
                forumId:thread.forumId,
                forumName:thread.forumName
            })

            if (view.anchor) {
                if (view.anchor == 'start') {
                    window.scrollTo(0, 0)
                } else if (view.anchor == 'end') {
                    window.scrollTo(0, doc.height())
                } else if (!!+view.anchor) {
                    window.scrollTo(0, doc.find('li[data-floorid="' + view.anchor + '"]').offset().top)
                }
            }

            if(adinfo&&adinfo.exposureUrl){
                var ex= adinfo.exposureUrl;
                for(var i in ex){
                    var _img=new Image();
                    _img.src=ex[i];
                }
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
                img.original = img.src.replace('-app','-w280.jpg')
            }else{
                img.original = img.src
            }
            var imghold = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='" + (img.width||4) + "' height='" + (img.height||3) + "' />";
            if (img.src.indexOf('xcar.com.cn/attachments') > 0) {
                return '<img src="' + imghold + '" class="lazy inimg" data-src="' + img.src + '" data-original="' + img.original + '" />'
            } else if (img.src.indexOf('/static/images/') > 0) {
                return '<img src="' + img.src + '" style="display: inline-block;width: .2rem;height: .2rem;vertical-align: text-top;" class="smillimg" />'
            } else if(img.src.indexOf('data:image/svg')>-1){
                return '<img src="' + img.src + '" style="width: 100%" />'
            }else {
                return '<img src="' + img.src + '" style="width: auto" class="lazy outimg" data-src="' + img.src + '" data-original="' + img.original + '" />'
            }
        }

        /* 渲染数据 */
        function render(t_pl, rdata) {
            console.log(rdata);
            var data = rdata.data;
            var imgreg = /<img.*?(?:>|\/>)/gi;
            if (data.floorInfo)
                data.floorInfo.content = data.floorInfo.content.replace(imgreg, imgfilter)

            var list = data.floorList;
            var _list = [];
            for (var i in list) {
                var item = list[i];
                item.content = item.content.replace(imgreg, imgfilter);
                if(item.replyInfo){
                    item.replyInfo.content= item.replyInfo.content.replace(imgreg, imgfilter)
                }
                _list.push(item)
            }
            data.floorList = _list;

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
                    if (view.imagemode == 2)
                        $(this).data('original', _src.replace('-app','-w280.jpg') )
                    else
                        $(this).data('original', _src)
                })
            }
            if (view.fontsize) {
                classlist.push(fontsize[param.fontsize])
            }
            doc.attr('class', classlist.join(' '));

        }
        function domevent(){
            var root = $('body');

            if(thread.error.errorCode != 1 ) {
                var _errorMsg = thread.error.errorMsg;
                $('.content').addClass('authority').html('<section class="authorityNote"><div><a></a><p>'+_errorMsg+'</p></div></section>');
            }
            root
            /** 关注 **/
                .on('click', '.avatar-concern', function () {  // 关注
                    var intention;     //用户行为意图   1 加   2 取消
                    if ($(this).hasClass('addConcern') || $(this).hasClass('tickConcern')) {
                        intention = 1
                    } else if ($(this).hasClass('cancelConcern') || $(this).hasClass('eachConcern')) {
                        intention = 2
                    }
                    if (user.uid) {
                        follow(intention)
                    } else {
                        jxcar.requestLogin({}, changeuser)
                            .then(function () {
                                //follow(intention)
                            })
                    }
                })
            /** 图片 **/
                .on('tap', '.master .inimg,.master .outimg', function () {
                   
                    var src = $(this).data('src')
                    src && jxcar.requestAuthorImages({
                        imageUrl: src
                    })
                })
                .on('tap', '.reply .inimg,.reply .outimg', function () { // 图片
                    var src = $(this).data('src');
                    var parent=$(this).parents('li');
                    var author=parent.data('authorid');
                    var nexthtml=$(this).next('.artical_img_txt').html();
                    if(author==thread.userInfo.authorId){
                        if($(this).parents('.reply-userContent')[0]){
                            src && jxcar.requestAuthorImages({
                                imageUrl: src
                            })
                            return true;
                        }
                    }

                    src && jxcar.requestSingleImage({
                        imageUrl: src,
                        note:nexthtml||''
                    })
                })
                if(thread.specialType == 1 || thread.specialType ==2 || thread.specialType ==3 || thread.userType ==3) return false;
            /** 点击分享 **/
                /*点击分享-点赞系列*/
                root
                .on('click', '.thumb', function () { 
                    if ($(this).hasClass('thumbed'))return;
                    if (user.uid) {
                        praise()
                    } else {
                        jxcar.requestLogin({}, changeuser) 
                        .then(praise);
                        //jxcar为异步的,为保证顺序执行praise放入回调
                    }

                })
                /*点击分享-其他圈子*/
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
            /** 点击活动 **/
                /*点击活动-点击活动报名*/
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
                 /*点击活动-点击投票选项*/
                .on('click','.note .js-vote-list input[name="vote"]',function (e) {
                    var checkedCount=$(".vote-item input:checked").size();
                    var _$num = $(".js-vote-num");
                    var _limit_count = _$num.attr("data-vote-limit-count");
                    if(voteType.type == 1){
                        var _limit_count = 1;
                    }
                    console.log(_limit_count);
                    // if(checkedCount > _limit_count){
                    //     e.preventDefault();
                    //     return;
                    // }
                    // _$num.html(+_limit_count-checkedCount)
                    if(checkedCount == _limit_count){
                        _$num.text(_limit_count - checkedCount);
                        $('input[name=vote]').each(function(index, el) {
                            var flag = $(el).prop('checked');
                            if(flag == false){
                                $(el).attr('disabled',true);
                                $(el).css('borderColor','gray');
                                // e.preventDefault(); // 需要吗
                                // return;
                            }
                        });
                    }
                    else{
                        _$num.text(_limit_count - checkedCount);
                        $('input[name=vote]').each(function(index, el) {
                            $(el).removeAttr('disabled');
                            $(el).css('borderColor','#1bacff');
                        });
                    }

                })
                /*点击活动-点击投票选项-点击投票*/
                .on('click','.note .js-vote',function () {
                    console.log('投票按钮被触发');
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
                        console.log('选了0个');
                        if(!$(".vote-item input:checked").size()){
                            jxcar.showMessage&&jxcar.showMessage({result:!1,message:"请选择投票选项"});
                            return;
                        }
                    }
                    var options = '',_$list = $(".js-vote-list li");
                    _$list.each(function () {
                        if($(this).find("input").prop("checked")){
                            options += "_"+$(this).attr("data-optionId");
                        }
                    });
                    options = options.substr(1);
                    console.log('以下是所选选项的ids');
                    console.log(options);
                    var _param = {
                        type:'post',
                        url : portUrl+'doPoll',
                        data :{
                            tid : thread.id,
                            option : options
                        },
                        timeout:8000
                    };
                    dispatch(_param)
                        .done(function (rs) {
                            console.log('数据发送成功,且有返回');
                            var res = JSON.parse(rs);//注意：此处为php直接返回接口，必须转成JSON格式使用，跟其他接口不同
                            if(res.data.errorCode == 1) {
                                renderVote(res.data.voteTotal,res.data.voteList);

                                jxcar.showMessage({result:!0,message:"投票成功"});
                            }else{
                                jxcar.showMessage({result:!1,message:res.data.errorMsg});
                            }
                        })
                        .fail(function (res) {
                            console.log('数据发送失败');
                            jxcar.showMessage&&jxcar.showMessage({result:!1,message:"加载失败，请检查网络后重试"});
                        });
                })
            /** footer操作 **/
                /*footer操作-回复楼层*/
                .on('click', '.btn-reply', function () {
                    var authorName, authorId, that = this, _$li = $(that).parents("li");
                    if (_$li[0]) {
                        _authorId = +_$li.attr('data-authorId');
                        _authorName = _$li.attr('data-authorName');
                    } else {
                        var _$master = $(".master");
                        _authorId = +_$master.attr('data-authorId');
                        _authorName = _$master.attr('data-authorName');
                    }
                    if (!user.uid) {
                        jxcar.requestLogin({}, changeuser);
                        return false;
                    }

                    jxcar.requestReply({
                        "forumId": thread.forumId,
                        "floorId": parseInt($(this).parents("footer").attr("data-floorId")),
                        "userId": _authorId,
                        "userName": _authorName
                    }).then(function (rs) {
                    })
                })
                /*footer操作-更多*/
                .on('click', '.btn-more', function () {
                    var _mcom = $(this).siblings('.more-parent');
                    var _isshow = _mcom.hasClass('showMore')
                    $('.showMore').removeClass('showMore').addClass('hideMore')
                    if (!_isshow) {
                        _mcom.removeClass('hideMore').addClass('showMore')
                    }
                })
                /*footer操作-更多-评分*/
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
                            _scorebox.html('评分' + (data.grade > 0 ? ('+' + data.grade) : ( data.grade)));
                            $(that).addClass('scoreded').html('已评分')
                        }
                    })
                })
                /*footer操作-更多-举报*/
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
                .on('click','.offline',function(e){
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
                    if (shareType) {
                        toshare(shareType);
                    }
                })


        }
        function datafail(){
            jxcar.onLoadFailure()
            con.removeClass('load').addClass('offline').html('<section class="reload"><div><a href="javascript:"></a><p>加载失败了,点击重试</p></div></section>');
            jxcar.showMessage&&jxcar.showMessage({result:false,message:"加载失败，请检查网络后重试"});
        }
        $.when(
            jxcar.requestCookie(changeuser),
            jxcar.requestInitialize(),
            jxcar.requestOthers(),
            jxcar.requestLocation()
        ).then(function () {
            var args = Array.prototype.slice.call(arguments);
            view = {
                fontsize: args[1].fontSize || 1,
                theme: args[1].theme > 2 ? 1 : args[1].theme,
                imagemode: args[1].imageMode || 1,
                anchor: args[1].anchor || 'start',

            }
            thread = {
                id: args[1].id,//args[1].id,
                type: args[1].type,
                page: args[1].page || 1,

            }
            deviceConfig = args[2];
            city=args[3];
            var param = {
                url: posturl,
                data: {
                    tid: thread.id,
                    page: thread.page,
                    type: thread.type,
                    cityId:city.cityId
                },
                timeout:20000

            }
            changeview(view);
            console.log(param);

            return dispatch(param)

        }).done(function (rs) {
            var rdata = JSON.parse(rs);
            thread.error = {
                errorCode: rdata.data.errorCode,
                errorMsg: rdata.data.errorMsg
            }
            if (rdata.data.threadInfo) {

                thread.isModerator = !!rdata.data.threadInfo.hasRight;
                thread.isFavorite = !!rdata.data.threadInfo.isCollected;

                var _isEssence = !!0;
                if (rdata.data.threadInfo.postStatus == '精华') {
                    _isEssence = !0;
                }
                $.extend(thread, rdata.data.threadInfo, {
                    isEssence: _isEssence
                });
            }

            if (rdata.data.shareInfo) {
                $.extend(share, {
                    title: rdata.data.shareInfo.title,
                    content: rdata.data.shareInfo.content||'点击查看帖子详情',
                    imageUrl: rdata.data.shareInfo.imageUrl,
                    linkUrl: rdata.data.shareInfo.webLink
                })
            }

            if(rdata.data.voteInfo){
                $.extend(voteType,rdata.data.voteInfo);
            }

            if(rdata.data.adInfo){
                adinfo=rdata.data.adInfo
            }
            $.extend(rdata.data,user);
            render(t_pl, rdata);
            renderview()

            $('.vcontent').attr('data-original','//m-js.xcar.com.cn/xcarapp7/static/pic/'+(view.theme?'videoholder-day.png':'videoholder-night.png'))
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
            
        }).fail(datafail).always(domevent);
        apievent()
    })

//     /
// *     * 传入data
//      * 渲染投票成功后的模版数据
//      * 投票百分比 没有小数点
//      * */
    function renderVote(total,list) {
        var voteStrs = '',_list = list;
        for(var i=0; i<_list.length; i++){
            var _myRate = _list[i].isSelect ? "rate-my" : "",
                _rate = total == 0 ? 0 : Math.round(_list[i].voteCount/total*100);
            voteStrs += '<li data-voteCount="'+_list[i].voteCount+'" data-optionId="'+_list[i].optionId+'">' +
                '<label><span class="voted-limit">'+ _list[i].content + '</span>' +
                '<div class="vote-item"><em>'+_rate+'%</em></div></label>' +
                '<div style="width:'+_rate+'%;" class="rate"><p class="rate-animate '+_myRate+'"></p></div></li>';
        }
        $(".js-vote-list").html(voteStrs);
        $(".js-vote").html("已投票，分享给好友").addClass("js-app-share");
        $(".js-vote-count").html(total+"人参加");
    }

});