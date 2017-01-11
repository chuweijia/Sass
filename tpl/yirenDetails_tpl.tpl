<div class="content">
    <section class="master">
        <!-- 用户信息 S -->
        <header class="master-msg ">
            <!-- 以下发帖人-页头-头像区(头像、关注) -->
            <div class="avatar">
                <# var  userlink ="appxcar://m.xcar.com.cn.yrsAuthor?params="+encodeURIComponent('{"id":'+ +data.newsInfo.authorId+'}') #>
                    <div class="avatar-photo">
                        <a class="level" data-level="V1" href="<#=userlink#>">
                            <div class="face-wrap lazy" data-original="<#=data.newsInfo.authorIcon#>" style="background-image:url('//m-js.xcar.com.cn/xcarapp7_debug/static/pic/face_default.png');background-size:100% auto;-webkit-background-size:100% auto;background-repeat:no-repeat;">
                                <img class="tx" src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='1' height='1' &gt;&lt;/svg&gt;" alt="">
                            </div>
                        </a>
                        <div class="avatar-name">
                            <a class="master-name" href="<#=userlink#>"><#=data.newsInfo.author#></a>
                            <p class="master-time"><#=data.newsInfo.time#></p>
                        </div>
                    </div    >
                <!-- js说明-togglclass('style-liue avatar-concern-liue') -->
                <# if(data.newsInfo.followStatus == 1){ #>
                    <a href="javascript:;" class="avatar-concern cancelConcern"><span>已关注</span></a>
                <# }else if(data.newsInfo.followStatus == 2 || data.newsInfo.followStatus == 0){ #>
                    <a href="javascript:;" class="avatar-concern addConcern"><span>关注</span></a>
                <# }else if(data.newsInfo.followStatus == 3){ #>
                    <a href="javascript:;" class="avatar-concern eachConcern"><span>相互关注</span></a>
                <# } #>
                <!-- 换成a标签 -->
            </div>
            <div class="title">
                <p class="master-title" id="mytitle"><#=data.newsInfo.title#></p>
            </div>
            <!-- 以下发帖人-页头-浏览量统计区(看、回、跳转论坛) -->
            <div class="check">
                <div class="check-num">
                    <div>
                        <span class="check-see"></span><span><#=data.newsInfo.viewCount#></span>
                    </div>
                    <div>
                        <span class="check-reply"></span><span><#=data.newsInfo.commentCount#></span>
                    </div>
                </div>
                <!-- <a class="check-forum blue" href="appxcar://m.xcar.com.cn.yrsList?params=<#=encodeURIComponent('{id:'+ +data.newsInfo.newsTagId+',name:"'+data.newsInfo.newsTag+'"}')#>"> -->
                <a class="check-forum" href="appxcar://m.xcar.com.cn.yrsList?params=<#=encodeURIComponent('{"id":'+data.newsInfo.newsTagId+',"name":"'+data.newsInfo.newsTag+'"}')#>">
                    <span class="forumName"><#=data.newsInfo.newsTag#></span>
                    <span class="forumIcon"></span>
                </a>
            </div>
        </header>
        <!-- 用户信息 E -->
        <!-- 文章内容 S -->
        <div class="master-content">
            <div>
                <#=data.newsInfo.content  #>
            </div>
        </div>
        <!-- 文章内容 E -->
        <!-- 分享 S -->
        <div class="master-share">
            <p><a href="javascript:;" class="thumb default<#=data.newsInfo.isSupport?' thumbed':''#>" data-type="thumb"><i>+1</i></a><span><#=data.newsInfo.praiseCount > 99999 ? '99999+' : data.newsInfo.praiseCount#></span></p><p><a class="friend default" href="javascript:"></a><span>朋友圈</span></p><p><a class="wechat default" href="javascript:"></a><span>微信好友</span></p><p><a class="sina default" href="javascript:"></a><span>微博</span></p>
        </div>
        <!-- 分享 E -->
    </section>
    <#if(data.topComment[0] || data.newComment[0]){ #>
    <section class="reply">
        <#if(data.topComment[0]){ #>
            <!-- 热门评论 S -->
            <section class="hot-reply">
                <h2 class="title">热门评论</h2>
                <ul>
                    <# for(var i in data.topComment){ var _tc=data.topComment[i]; #>
                        <# var _tculink ="appxcar://m.xcar.com.cn.personal?params="+encodeURIComponent('{"uid":"'+_tc.userId+'","uname":"'+_tc.userName+'"}') #>

                        <li data-id="<#=_tc.commentId#>" data-userid="<#=_tc.userId#>" data-username="<#=_tc.userName#>">
                            <!-- reply-re-图文-special -->
                            <header>
                                <div class="avatar  ">
                                    <div class="avatar-photo  ">
                                        <a href="<#=_tculink#>" class="level">
                                            <div class="face-wrap lazy" data-original="<#=_tc.icon#>" style="background-image:url('//m-js.xcar.com.cn/xcarapp7_debug/static/pic/face_default.png');background-size:100% auto;-webkit-background-size:100% auto;background-repeat:no-repeat;">
                                                <img class="tx" src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='1' height='1' &gt;&lt;/svg&gt;" onerror="this.src='http://m-js.xcar.com.cn/xcarapp7/static/pic/face_default.png';this.onerror=function(){}" alt="">
                                            </div>
                                        </a>
                                        <div class="avatar-name">
                                            <a href="<#=_tculink#>" class="master-name yiren-name"><#=_tc.userName#></a>
                                            <p class="master-time"><#=_tc.time#></p>
                                        </div>
                                    </div>
                                </div>
                            </header>
                            <div class="reply-content">
                                <div class="reply-userContent"><#=_tc.content#></div>
                                <# if(_tc.imageUrl){ #>
                                    <div class="insert-img">
                                        <img src="<#=_tc.imageUrl#>" alt="">
                                    </div>
                                    <# } #>
                            </div>
                            <footer class="like-operate clearfix">
                                <a href="javascript:" class="like<#=_tc.isSupport?' like-in':''#>"><i>+1</i><span><#=_tc.praiseCount > 99999 ? '99999+' : _tc.praiseCount#></span></a>
                                <a href="javascript:" class="enter">&nbsp;</a>
                            </footer>
                        </li>
                        <#}#>
                </ul>
            </section>
            <!-- 热门评论 E -->
        <#}#>
        <# if(data.newComment[0]){ #>
            <!-- 最新评论 S -->
            <section class="best-new">
                        <h2 class="title">最新评论</h2>
                        <ul>
                            <# for(var i in data.newComment){ var _nc=data.newComment[i]; #>
                                 <# var _nculink ="appxcar://m.xcar.com.cn.personal?params="+encodeURIComponent(JSON.stringify({uid:parseInt(_nc.userId),uname:_nc.userName})) #>

                                <li data-id="<#=_nc.commentId#>"  data-userid="<#=_nc.userId#>" data-username="<#=_nc.userName#>">
                                    <!-- reply-re-图文-special -->
                                    <header>
                                        <div class="avatar  ">
                                            <div class="avatar-photo  ">
                                                <a href="<#=_nculink#>" class="level">
                                                    <div class="face-wrap lazy" data-original="<#=_nc.icon#>" style="background-image:url('//m-js.xcar.com.cn/xcarapp7_debug/static/pic/face_default.png');background-size:100% auto;-webkit-background-size:100% auto;background-repeat:no-repeat;">
                                                        <img class="tx" src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='1' height='1' /&gt;" alt="">
                                                    </div>
                                                </a>
                                                <div class="avatar-name">
                                                    <a href="<#=_nculink#>" class="master-name yiren-name"><#=_nc.userName#></a>
                                                    <p class="master-time"><#=_nc.time#></p>
                                                </div>
                                            </div>
                                        </div>
                                    </header>
                                    <div class="reply-content">
                                        <div class="reply-userContent"><#=_nc.content#></div>
                                        <# if(_nc.layoutList)for(var i in _nc.layoutList){ var _ll=_nc.layoutList[i]; #>
                                            <div class="reply-re-content">
                                                <header>
                                                    <div class="avatar">
                                                        <div><#=_ll.userName#></div>
                                                        <div>
                                                            <span><#=_ll.floorName#></span>
                                                        </div>
                                                    </div>
                                                </header>
                                                <div>
                                                    <div class="reply-info"><#=_ll.content#></div>
                                                </div>
                                            </div>
                                            <# } #>

                                            <# if(_nc.imageUrl){ #>
                                            <div class="insert-img">
                                                <img src="<#=_nc.imageUrl#>" alt="">
                                            </div>
                                            <# } #>
                                    </div>
                                    <footer class="like-operate clearfix">
                                        <a href="javascript:" class="like<#=_nc.isSupport?' like-in':''#>"><i>+1</i><span><#=_nc.praiseCount > 99999 ? '99999+' : _nc.praiseCount#></span></a>
                                        <a href="javascript:" class="enter"></a>
                                    </footer>
                                </li>
                                <# } #>
                        </ul>
            </section>
            <!-- 最新评论 E -->
        <# } #>
    </section>
    <# } #>
    <# if(+data.newsInfo.commentCount>5){ #>
        <div class="more-bt"><a href="javascript:" class="show">查看更多评论</a></div>
    <# } #>
</div>