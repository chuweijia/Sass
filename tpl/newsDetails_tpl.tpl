<div class="content">
    <# if(data.newsInfo.imageUrl){ #>
        <!-- 头图 S -->
        <div class="banner lazy" data-original="<#=data.newsInfo.imageUrl#>"><img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='3' height='2' />" alt=""></div>
        <!-- 头图 E -->
    <# } #>
    <section class="master">
        <!-- 用户信息 S -->
        <header class="master-msg ">
            <div class="title">
                <p class="master-title" id="mytitle"><#=data.newsInfo.title#></p>
            </div>
            <!-- <div class="avatar">
                <# var  userlink ="appxcar://m.xcar.com.cn.personal?params="+encodeURIComponent('{"uid":'+data.newsInfo.authorUid+',"uname":"'+data.newsInfo.author+'"}') #>
                <div class="avatar-photo">
                    <a class="level" data-level="V1" href="<#=data.newsInfo.authorUid != '' ? userlink:'javascript:;'#>">
                        <div class="face-wrap lazy" data-original="<#=data.newsInfo.authorIcon#>">
                            <img class="tx" src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='1' height='1' &gt;&lt;/svg&gt;" />
                        </div>
                    </a>
                    <div class="avatar-name">
                        <a class="master-name" href="<#=data.newsInfo.authorUid != '' ? userlink:'javascript:;'#>"><span class="txt"><#=data.newsInfo.author#> </span>
                        <# if(data.newsInfo.tag != ''&& data.newsInfo.authorUid != ''){ #>  
                            <em><span><#=data.newsInfo.tag#></span></em>
                        <# } #>
                        </a>
                        <p class="master-time"><#=data.newsInfo.time#></p>
                    </div>
                </div>

                <# if(data.newsInfo.authorUid != 0 && data.newsInfo.authorUid != "") { #>
                    <# if(data.newsInfo.followStatus == 1){ #>
                        <a href="javascript:;" class="avatar-concern cancelConcern"><span>已关注</span></a>
                        <# }else if(data.newsInfo.followStatus == 0 || data.newsInfo.followStatus == 2){ #>
                        <a href="javascript:;" class="avatar-concern tickConcern"><span>加关注</span></a>
                        <# }else if(data.newsInfo.followStatus == 3){ #>
                        <a href="javascript:;" class="avatar-concern eachConcern"><span>相互关注</span></a>
                        <# } #>
                <# } #>
            </div> -->


           <!--  <div class="news-avatar"> 
                <div class="news-avatar-left">
                    <p><span>编辑</span><# if(data.newsInfo.author != '') {#><i>：</i>
                    <#}#>
                    </p>
                    <span><#=data.newsInfo.author#></span>
                </div>
            <span><#=data.newsInfo.time#></span>
            </div> -->
             <div class="news-check">
                <div class="news-check-name">
                    <span>编辑</span><# if(data.newsInfo.author != '') {#><i>：</i>
                    <#}#><span class="editor"><#=data.newsInfo.author#></span>
                </div>
                <span><#=data.newsInfo.time#></span>
            </div>
        </header>
        <!-- 用户信息 E -->
        <!-- 文章内容 S -->
        <div class="master-content">
            <# var orangePrice = [1,5,7,8];var useBtn = [1,2];#>
            <#for(var i in data.contentList){ var item=data.contentList[i]; #>
                
                <div data-page="<#=i#>"><#=item.content#></div>
                <#if(item.seriesInfo){ var _s=item.seriesInfo;var _type = _s.saleType;var _link="appxcar://m.xcar.com.cn.carseries?params="+encodeURIComponent('{"id":'+_s.seriesId+',"name":"'+_s.seriesName+'"}') #>
            <!-- 询底价 S -->
           <!--  <div class="consult-price">
                <a class="left" href="<#=_link#>">
                    <p class="img-wrap lazy" data-original="<#=_s.imageUrl#>">
                        <img src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='1' height='1' &gt;&lt;/svg&gt;" />
                    </p>
                    <div class="text-info">
                        <span class="name"><#=_s.seriesName#></span><span class="price <#=orangePrice.indexOf(_type) > -1 ? ' orange':' gray'#>"><#=_s.guidePrice#></span>
                    </div>
                </a>
                <# var _p={"seriesId":_s.seriesId,"name":_s.seriesName} #>
                <# var _ask="appxcar://m.xcar.com.cn.askprice?params="+encodeURIComponent(JSON.stringify(_p)) #>
                <div class="right"><a data-id="<#=_s.seriesId#>" href="<#=useBtn.indexOf(_type) > -1 ? _ask : 'javascript:;'#>" class="btn <#=useBtn.indexOf(_type) > -1 ? ' use':' unuse'#>">询底价</a></div>
            </div> -->
            <!-- 询底价 E -->
            <#}#>
        <# } #>
        </div>
        <!-- 文章内容 E -->
        <!-- 分享 S -->
        <div class="master-share">
            <p><a href="javascript:;" class="thumb default <# if(data.newsInfo.isSupport == 1){#> thumbed<# } #>" data-type="thumb"><i>+1</i></a>
                <span><#=data.newsInfo.praiseCount > 99999 ? '99999+' : data.newsInfo.praiseCount#></span></p><p><a class="friend default" href="javascript:"></a><span>朋友圈</span></p><p><a class="wechat default" href="javascript:"></a><span>微信好友</span></p><p><a class="sina default" href="javascript:"></a><span>微博</span></p>
        </div>
        <!-- 分享 E -->
    </section>
    <# if(data.recommendList[0] || data.topComment[0] || data.newComment[0]){ #>
        <section class="reply">
        <!-- 精彩推荐 S-->
        <# if(data.recommendList[0]){ #>
            <section class="recommend-mode">
                <h2 class="title">精彩推荐</h2>
                <# var _len,_ritem; #>
                <# if(data.recommendList.length == undefined){ #>
                   <# _len = 1; #>
                <# } else {#> 
                   <# _len = data.recommendList.length > 4 ? 4:data.recommendList.length; #>
                <# } #>
                <# for(var i = 0;i < _len;i++){ _ritem = (_len == 1) ? data.recommendList :data.recommendList[i]; #>
                    <# var p,adtype,adname;#>
                            <# var listType = _ritem.type;#>
                           <# if(listType == 12 || listType == 13){ #>
                                    <# var _p1={title:_ritem.title,content:_ritem.title,imageUrl:_ritem.shareImage,linkUrl:_ritem.link,url:_ritem.shareLink} #>
                                    <# p = _p1;adtype='advertisement';#>
                            <# } else if(listType == 1){#><!-- 新闻 -->
                                    <# var _p2={id:_ritem._id} #>
                                    <# p = _p2;adtype='news';#>
                            <# } else if(listType == 2){#><!-- 帖子 -->
                                    <# var _p2={id:_ritem._id} #>
                                    <# p = _p2;adtype='post';#>
                            <# } #>

                    <# var  advertLink ="appxcar://m.xcar.com.cn."+adtype+"?params="+encodeURIComponent(JSON.stringify(p)); #>
                    <a href="<#=advertLink#>" class="recommend-list">
                        <div class="left">
                            <span class="name"><#=_ritem.title#></span>
                            <# if(_ritem.label){#>
                                <em class="tag"><span><#=_ritem.label #></span></em>
                            <# } else{ #>
                                <span class="time"><#=_ritem.commentCount > 99999 ? '99999+' : _ritem.commentCount #>评论</span>
                            <# } #>
                        </div>
                        <div class="right lazy" data-original="<#=_ritem.imageUrl#>">
                            <img src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='4' height='3' &gt;&lt;/svg&gt;">
                        </div>
                    </a>
                <# } #>
            </section>
        <# } #>
        <!-- 精彩推荐 E -->
        <!-- 热门评论 S -->
        <#if(data.topComment[0]){ #>
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
                                            <img class="tx" src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='1' height='1' &gt;&lt;/svg&gt;" />
                                        </div>
                                    </a>
                                    <div class="avatar-name">
                                        <a href="<#=_tculink#>" class="master-name"><span class="txt"><#=_tc.userName#></span></a>
                                        <p class="master-time"><#=_tc.time#></p>
                                    </div>
                                </div>
                            </div>
                        </header>
                        <div class="reply-content">
                            <div class="reply-userContent"><#=_tc.content#></div>
                            <# if(_tc.imageUrl){ #>
                                <div class="insert-img">
                                    <img data-original="<#=_tc.imageUrl#>" class="lazy"  data-src="<#=_tc.imageUrl#>" src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='4' height='3' &gt;&lt;/svg&gt;" alt="">
                                </div>
                            <# } #>
                        </div>
                        <footer class="like-operate clearfix">
                            <a href="javascript:" class="like<#=_tc.isSupport?' like-in':''#>"><i>+1</i><span><#=_tc.praiseCount > 99999 ? '99999+' : _tc.praiseCount#></span></a>
                            <a href="javascript:" class="enter"></a>
                        </footer>
                    </li>
                <#}#>
                </ul>
            </section>
        <#}#>
        <!-- 热门评论 E -->
        <!-- 最新评论 S -->
        <# if(data.newComment[0]){ #>
            <section class="best-new">
                <h2 class="title">最新评论</h2>
                <ul>
                    <# for(var i in data.newComment){ var _nc=data.newComment[i]; #>
                    <# var _nculink ="appxcar://m.xcar.com.cn.personal?params="+encodeURIComponent(JSON.stringify({uid:+_nc.userId,uname:_nc.userName})) #>
                    <li data-id="<#=_nc.commentId#>"  data-userid="<#=_nc.userId#>" data-username="<#=_nc.userName#>">
                        <header>
                            <div class="avatar  ">
                                <div class="avatar-photo  ">
                                    <a href="<#=_nculink#>" class="level">
                                        <div class="face-wrap lazy" data-original="<#=_nc.icon#>" style="background-image:url('//m-js.xcar.com.cn/xcarapp7_debug/static/pic/face_default.png');background-size:100% auto;-webkit-background-size:100% auto;background-repeat:no-repeat;">
                                            <img class="tx" src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='1' height='1' &gt;&lt;/svg&gt;" />
                                        </div>
                                    </a>
                                    <div class="avatar-name">
                                        <a href="<#=_nculink#>" class="master-name"><span class="txt"><#=_nc.userName#></span></a>
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
                                    <img data-original="<#=_nc.imageUrl#>" class="lazy" data-src="<#=_nc.imageUrl#>" src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='4' height='3' &gt;&lt;/svg&gt;" alt="">
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
        <# } #>
        <!-- 最新评论 E -->
        </section>
        <# if(+data.newsInfo.commentCount>5){ #>
            <div class="more-bt"><a href="javascript:" class="show">查看更多评论</a></div>
        <# } #>
    <# } #>
</div>
