<div class="content">
    <!-- 发帖人 S -->
    <# console.log(data)#>
    <# if(data.floorInfo){ #>
        <# var  userlink ="appxcar://m.xcar.com.cn.personal?params="+encodeURIComponent(JSON.stringify({uid:parseInt(data.floorInfo.userInfo.authorId),uname:data.floorInfo.userInfo.authorName})) #>
        <section class="master" data-tid="<#=data.threadInfo.tid #>" data-forumId="<#=data.threadInfo.forumId #>"  data-floorId="<#=data.floorInfo.floorId #>" data-authorId="<#=data.floorInfo.userInfo.authorId #>" data-authorName="<#=data.floorInfo.userInfo.authorName #>">
            <header class="master-msg">
                <div class="avatar">
                    <div class="avatar-photo ">
                        <a href="<#=userlink#>" class="level js-avatar" data-level="V<#=data.floorInfo.userInfo.carLevel #>" data-authorId="<#=data.floorInfo.userInfo.authorId #>" data-authorName="<#=data.floorInfo.userInfo.authorName #>">
                            <div class="face-wrap lazy" data-original="<#=data.floorInfo.userInfo.icon #>" style="background-image:url('//m-js.xcar.com.cn/xcarapp7_debug/static/pic/face_default.png');background-size:100% auto;-webkit-background-size:100% auto;background-repeat:no-repeat;">
                                <img class="tx" src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='1' height='1' &gt;&lt;/svg&gt;" />
                            </div>
                            <# if(data.floorInfo.userInfo.carLevel){ #>
                            <i class="icon">V<#=data.floorInfo.userInfo.carLevel#></i>
                            <#}#>
                            <!-- <i class="icon">V6</i> -->
                        </a>
                        <div class="avatar-name">
                            <a href="<#=userlink#>" class="master-name"><span class="txt"><#=data.floorInfo.userInfo.authorName #></span>  
                            </a>
                            <p class="master-time"><#=data.floorInfo.time #></p>
                        </div>
                    </div>
        <# if((data.floorInfo.userInfo.authorId != 0) && (data.floorInfo.userInfo.authorId != data.uid)){ #>
            <# if(data.floorInfo.userInfo.followStatus == 1){ #>
            <a href="javascript:;" class="avatar-concern cancelConcern"><span>已关注</span></a>
            <# }else if(data.floorInfo.userInfo.followStatus == 0 || data.floorInfo.userInfo.followStatus == 2){ #>
            <a href="javascript:;" class="avatar-concern addConcern"><span>关注</span></a>
            <# }else if(data.floorInfo.userInfo.followStatus == 3){ #>
            <a href="javascript:;" class="avatar-concern eachConcern"><span>相互关注</span></a>
            <# } #>
        <# } #>
                </div>
                <!-- 以下发帖人-页头-题目区 -->
                <div class="title">
                        <p class="master-title">
                            <#=data.threadInfo.title #>&nbsp;&nbsp;
                            <# var postColor ; #>
                            <# if(data.threadInfo.postStatus == ''){ postColor = 'disnone'; #>
                            <# } else if(data.threadInfo.postStatus == '已关闭'){ postColor = 'iconGray'; #>
                            <# } else if(data.threadInfo.postStatus == '精华'){ postColor = 'iconRed essence'; #>
                            <# } else { postColor = 'iconRed'; #>
                            <# } #>
                            <em class ="<#=postColor#>">
                                <span><#=data.threadInfo.postStatus#></span>
                            </em>
                      <!--   <# if (data.threadInfo.specialType == 2 ){ #>
                            <em class ="iconGray">
                                <span>已关闭</span>
                            </em>
                        <# } #> -->
                            
                        <# if(data.threadInfo.postType == 3 ||data.threadInfo.postType == 4){ #>
                            <em class="iconBlue">
                                <# if(data.threadInfo.postType == 3){ #>
                                    <span><#=data.activityInfo.type #></span>
                                <# } else if(data.threadInfo.postType == 4){ #>
                                    <span><#=data.voteInfo.type == 1?'单选':'多选'#></span>
                                <# } #>
                            </em>
                        <# } #>
                        </p>
                </div>
                <!-- 以下发帖人-页头-浏览量统计区(看、回、跳转论坛) -->
                <div class="check ">
                    <div class="check-num ">
                        <div>
                            <span class="check-see"></span><span><#=data.threadInfo.viewCount #></span>
                        </div>
                        <div>
                            <span class="check-reply"></span><span><#=data.threadInfo.replyCount #></span>
                        </div>
                    </div>
                    <a href="appxcar://m.xcar.com.cn.forum?params=<#=encodeURIComponent('{"id":'+data.threadInfo.forumId+',"name":"'+data.threadInfo.forumName+'"}')#>" class="check-forum" data-forumId="<#=data.threadInfo.forumId #>">
                        <span class="forumName"><#=data.threadInfo.forumName #></span>
                        <span class="forumIcon"></span>
                    </a>
                </div>
            </header>
            <!-- 以下发帖人-内容-->
            <div class="master-content">
                <div class="">
                    <#=data.floorInfo.content #>
                </div>
                <# if(data.threadInfo.postType == 3 && data.activityInfo){ #>
                    <!-- 活动贴 S-->
                    <div class="note" data-activity-limit="<#=data.activityInfo.signUpLimit #>" data-activity-need-phone="<#=data.activityInfo.needTel #>">
                        <div class="note-table">
                            <div class="head">
                                <p><# if(data.activityInfo.status == 1){ #>活动审核中<# }else if(data.activityInfo.status == 2){ #>活动进行中<# }else{ #>活动已结束<# } #></p><span class="note-line"></span><p class="js-activity-count"><#=data.activityInfo.joinCount #>人参加</p>
                            </div>
                            <ul class="body activity"> <!-- activity 不要叠加 -->
                                <li class="clearfix">
                                    <span>活动时间:</span>
                                    <p><#=data.activityInfo.time #></p>
                                </li>
                                <li class="clearfix">
                                    <span>活动地点:</span>
                                    <p><#=data.activityInfo.address #></p>
                                </li>
                                <li class="clearfix">
                                    <span>人均花销:</span>
                                    <p><#=data.activityInfo.cost #></p>
                                </li>
                                <li class="clearfix">
                                    <span>活动人数:</span>
                                    <p><#=data.activityInfo.person #><#if(data.activityInfo.person != '不限'){ #>人<#}#></p>
                                </li>
                            </ul>
                            <div class="foot">
                                <a href="javascript:" class=" <# if(!data.activityInfo.clickable){ #>disable<# } #> js-apply"><#=data.activityInfo.signUp #></a>
                            </div>
                        </div>
                        <div class="note-info">
                            <p>报名截止至:<span><#=data.activityInfo.endTime #></span></p>
                            <# if(data.activityInfo.desc){ #><p><#=data.activityInfo.desc #></p><# } #>
                        </div>
                    </div>
                    <# } #>
                        <# if(data.threadInfo.postType == 4 && data.voteInfo){ #>
                            <!-- 投票贴 S-->
                            <div class="note" data-vote-type="<#=data.voteInfo.type #>">
                                <div class="note-table">
                                    <div class="head">
                                        <p><# if(data.voteInfo.status == 1){ #>投票进行中<# }else{ #>投票已结束<# } #></p><span class="note-line"></span><p class="js-vote-count"><#=data.voteInfo.voteTotal #>人参加</p>
                                    </div>
                                    <ul class="body vote js-vote-list">
                                        <# if(data.voteInfo.isVote){ #>
                                            <# for(var i = 0; i < data.voteInfo.voteList.length; i++) { #>
                                            <li data-voteCount="<#=data.voteInfo.voteList[i].voteCount #>" data-optionId="<#=data.voteInfo.voteList[i].optionId #>">
                                                <label>
                                                    <span class="voted-limit"><#=data.voteInfo.voteList[i].content #></span>
                                                    <div class="vote-item">
                                                        <em><#=Math.round(data.voteInfo.voteList[i].voteCount/data.voteInfo.voteTotal*100) #>%</em>
                                                    </div>
                                                </label>
                                                <div style="width:<#=Math.round(data.voteInfo.voteList[i].voteCount/data.voteInfo.voteTotal*100) #>%;" class="rate"><p class="rate-animate <# if(data.voteInfo.voteList[i].isSelect){ #>rate-my<# } #>"></p></div>
                                            </li>
                                            <# } #>
                                        <# }else{ #>
                                            <# for(var i = 0; i < data.voteInfo.voteList.length; i++) { #>
                                            <# var _rate = data.voteInfo.voteTotal == 0 ? 0:Math.round(data.voteInfo.voteList[i].voteCount/data.voteInfo.voteTotal*100);#>
                                            <li data-voteCount="<#=data.voteInfo.voteList[i].voteCount #>" data-optionId="<#=data.voteInfo.voteList[i].optionId #>">
                                                <label>
                                                    <span class ="<#=data.voteInfo.isResultLimit == 1?'vote-limit':'vote-nolimit' #>"><#=data.voteInfo.voteList[i].content #></span>
                                                    <div class="vote-item">
                                                        <# if(!data.voteInfo.isResultLimit){ #><em><#= _rate#>%</em><# } #>
                                                        <input type="checkbox" value="" name="vote">
                                                    </div>
                                                </label>
                                                <# if(!data.voteInfo.isResultLimit){ #><div style="width:<#= _rate#>%;" class="rate"><p class="rate-animate"></p></div><# } #>
                                            </li>
                                            <# } #>
                                        <# } #>
                                    </ul>
                                    <div class="foot">
                                        <a href="javascript:" class=" <# if(!data.voteInfo.clickable){ #>disable<# } #> js-vote <# if(data.voteInfo.isVote){ #>js-app-share<# } #>"><#=data.voteInfo.voteButton #><# if(data.voteInfo.voteLimit && !data.voteInfo.isVote){ #> （还可选<span class="vote-num js-vote-num" data-vote-limit-count="<#=data.voteInfo.voteLimit #>"><#=data.voteInfo.voteLimit #></span>项）<# } #></a>
                                    </div>
                                </div>
                                <div class="note-info">
                                    <# if(data.voteInfo.endTime){ #><p>投票截止至:<span><#=data.voteInfo.endTime #></span></p><# } #>
                                        <# if(data.voteInfo.desc){ #><p><#=data.voteInfo.desc #></p><# } #>
                                </div>
                            </div>
                            <# } #>
            </div>
            <!-- 以下发帖人-分享 -->
            <!-- js说明-togglclass('selected') -->
            <div class="master-share">
                <p><a href="javascript:;" class="thumb default <# if(data.threadInfo.isSupport == 1){#> thumbed<# } #>" data-type="thumb"><i>+1</i></a><span><#=data.threadInfo.praiseCount > 99999 ? '99999+' : data.threadInfo.praiseCount#></span></p>
                <p><a href="javascript:;" class="friend default"></a><span>朋友圈</span></p>
                <p><a href="javascript:;" class="wechat default" ></a><span>微信好友</span></p>
                <p><a href="javascript:;" class="sina default" ></a><span>微博</span></p>
            </div>
            <# if(data.floorInfo.editInfo && data.floorInfo.editInfo != ''){ #>
                <div class="reply-time">
                    <div><span><#=data.floorInfo.editInfo#></span></div>
                </div>
            <# } #> 
            <!-- 以下页脚 (此处footer可在任意处调用) -->
            <footer class="master-operate" data-floorId="<#=data.floorInfo.floorId #>">
                <# if(data.floorInfo.rateCount){  console.log(data.floorInfo)#>
                <div class="score">
                    评分<# if(data.floorInfo.rateCount > 0){ #>+<# }else{ #><# } #><#=data.floorInfo.rateCount #>
                </div>
                <# } #>
                <div class="option">
                    <a href="javascript:;" class="btn-reply">回复本楼</a>
                    <span class="line-col"></span>
                    <a href="javascript:;" class="btn-more">更多</a>
                    <div class="more-parent hideMore">
                        <div class="more-content">
                            <p>
                                <!--<a class="scoreded">已评分</a>-->
                                <# if(data.floorInfo.isRate==1){ #><a href="javascript:" class="btn-grade scoreded">已评分<# }else{ #>
                                    <a href="javascript:" class="btn-grade">评分<# } #>
                                    </a><span class="more-line"></span><# if(data.floorInfo.isReport==1){ #><a href="javascript:" class="btn-report scoreded">已举报<# }else{ #>
                                    <a href="javascript:" class="btn-report">举报<# } #> </a>
                            </p>
                        </div><div class="more-san"></div>
                    </div>
                </div>
            </footer>
             
            <# if(data.adInfo) { #>
                <# var _p={title:data.adInfo.title,content:data.adInfo.title,imageUrl:data.adInfo.shareImage,linkUrl:data.adInfo.link,url:data.adInfo.shareLink} #>
                <# var _p2={id:data.adInfo.id} #>
                <# var p,adtype;if(data.adInfo.type == 12||data.adInfo.type == 13){ p=_p;adtype='advertisement' }else{ p=_p2;adtype='post' } #>
                <# var  advertLink ="appxcar://m.xcar.com.cn."+adtype+"?params="+encodeURIComponent(JSON.stringify(p)); #>
                <div class="advert">
                    <em><span>广告</span></em>
                    <a href="<#=advertLink#>"><#=data.adInfo.title#></a>
                </div>
            <# } #>



        </section>
        <# } #>
            <!-- 发帖人 E --> 
            <!-- 回帖人 S -->
            <# if(data.floorList != undefined && data.floorList != null && data.floorList != ""){ #>
                <section class="reply">
                    <ul>
                        <# for(var i = 0; i < data.floorList.length; i++) { #>



                        <# var  userlink ="appxcar://m.xcar.com.cn.personal?params="+encodeURIComponent(JSON.stringify({uid:parseInt(data.floorList[i].userInfo.authorId),uname:data.floorList[i].userInfo.authorName})) #>


                        <li data-floorId="<#=data.floorList[i].floorId #>" data-tid="<#=data.threadInfo.tid #>" data-authorId="<#=data.floorList[i].userInfo.authorId #>" data-authorName="<#=data.floorList[i].userInfo.authorName #>">
                            <header>
                                <div class="avatar ">
                                    <div class="avatar-photo ">
                                        <a href="<#=userlink#>" class="level js-avatar" data-level="V<#=data.floorList[i].userInfo.carLevel #>">
                                            <div class="face-wrap lazy" data-original="<#=data.floorList[i].userInfo.icon #>" style="background-image:url('//m-js.xcar.com.cn/xcarapp7_debug/static/pic/face_default.png');background-size:100% auto;-webkit-background-size:100% auto;background-repeat:no-repeat;">
                                                <img class="tx" src="data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' width='1' height='1' &gt;&lt;/svg&gt;"/>
                                            </div>
                                            <# if(data.floorList[i].userInfo.carLevel){ #>
                                                <i class="icon">V<#=data.floorList[i].userInfo.carLevel#></i>
                                                <#}#>
                                        </a>
                                        <div class="avatar-name">
                                            <a href="<#=userlink#>" class="master-name"><span class="txt"><#=data.floorList[i].userInfo.authorName #></span>
                                            </a>
                                            <p class="master-time"><#=data.floorList[i].time #></p>
                                        </div>
                                    </div>
                                    <div class="avatar-floor" data-floorId="<#=data.floorList[i].floorId #>">
                                        <span><#=data.floorList[i].floorName #></span>楼
                                    </div>
                                </div>
                            </header>
                            <div class="reply-content">
                                <# if (data.floorList[i].replyInfo) { #>
                                    <div class="reply-re-content">
                                        <header>
                                            <div class="avatar ">
                                                <div><#=data.floorList[i].replyInfo.userInfo.authorName #></div>
                                                <div>
                                                    <span data-floorId="<#=data.floorList[i].replyInfo.floorId #>"><#=data.floorList[i].replyInfo.floorName #></span> 楼
                                                </div>
                                            </div>
                                        </header>
                                        <div>
                                            <#=data.floorList[i].replyInfo.content #>
                                        </div>
                                    </div>
                                    <# } #>
                                     <div class="reply-userContent"><#=data.floorList[i].content #></div>
                                        <# if(data.floorList[i].editInfo && data.floorList[i].editInfo !='') { #>
                                            <div class="reply-time ">
                                                <div><span><#=data.floorList[i].editInfo#></span></div>
                                            </div>
                                            <# } #>
                            </div>
                            <footer class="master-operate" data-floorId="<#=data.floorList[i].floorId #>">
                                <# if(data.floorList[i].rateCount){ #>
                                <div class="score">
                                    评分<# if(data.floorList[i].rateCount > 0){ #>+<# }else{ #><# } #><#=data.floorList[i].rateCount #>
                                </div>
                                <# } #>
                                <div class="option">
                                    <a href="javascript:;" class="btn-reply">回复本楼</a>
                                    <span class="line-col"></span>
                                    <a href="javascript:;" class="btn-more">更多</a>
                                    <div class="more-parent hideMore">
                                        <div class="more-content">
                                            <p>
                                                <!--<a class="scoreded">已评分</a>-->
                                                <# if(data.floorList[i].isRate==1){ #><a href="javascript:" class="btn-grade scoreded">已评分<# }else{ #>
                                                    <a href="javascript:" class="btn-grade">评分<# } #>
                                                    </a><span class="more-line"></span><# if(data.floorList[i].isReport==1){ #><a href="javascript:" class="btn-report scoreded">已举报<# }else{ #>
                                                    <a href="javascript:" class="btn-report">举报<# } #></a>
                                            </p>
                                        </div><div class="more-san"></div>
                                    </div>
                                </div>
                            </footer>
                        </li>
                        <# } #>
                    </ul>
                </section>
                <!-- 回帖人 E -->
                <# } #>
</div>