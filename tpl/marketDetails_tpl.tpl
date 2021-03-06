<div class="content">
    <section class="master">
        <header class="master-msg ">
            <div class="title">
                <p class="master-title" id="mytitle"><#=data.title#></p>
            </div>
            <div class="cx-time">
                促销时间：<em class="blue"><#=data.time#></em>还剩<em class="blue"><#=data.residualTime#></em>天
            </div>
        </header>
        <div class="master-content">
            <p><#=data.content#></p>
            <!-- 价格表 -->
            <div class="type-wrap">
                <h2><#=data.seriesName#>优惠车型价格表</h2>
                <div class="type-con">
                <# for(var i in data.carList){ var _cl=data.carList[i] #>
                    <div class="type-item">
                        <div class="type-info">
                            <div class="type"><#=_cl.carYear#><#=data.seriesName#> <#=_cl.carName#></div>
                            <span class="price price1"><#=_cl.originalPrice#></span>
                            <span class="price price2"><#=_cl.cutPrice#></span>
                            <span class="price price3"><#=_cl.presentPrice#></span>
                        </div>
                        <# var _p={"seriesId":data.seriesId,"carId" : _cl.carId,"name":_cl.carYear + data.seriesName + " "+_cl.carName}; #>
                        <# var _ask="appxcar://m.xcar.com.cn.askprice?params="+encodeURIComponent(JSON.stringify(_p)); #>
                        <a href="<#=_ask#>" class="ask-price-btn btn-sml">询底价</a>       <!--  点击效果添加类名 active -->
                    </div>
                <# } #>
                </div>
                <# var _p={"seriesId":data.seriesId,"name":data.seriesName}; #>
                <# var _ask="appxcar://m.xcar.com.cn.askprice?params="+encodeURIComponent(JSON.stringify(_p)); #>
                <a href="<#=_ask#>" class="ask-price-btn btn-big">询底价</a>        <!--  点击效果添加类名 active -->
                <div class="caption">市场价格波动频繁，实际优惠幅度请以到店咨询为主。</div>
            </div>
            <!-- 价格表 end -->
            <p><#=data.contentBottom#></p>
        </div>
    </section>
    <!-- 地址电话  点击效果添加类名 active -->
   <!--  <div class="ads-tel">
        <div class="ads-con">
            <div class="name">北京运通博达汽车销售服务有效公北京运通博达</div>
            <div class="ads">地址：北京亦庄经济技术开发区东环北路乙1号</div>
        </div>
        <div class="tel">     
            <em></em>
        </div>
    </div> -->
    <!-- 地址电话 end -->
    <!-- 询底价 S -->
    <!-- <div class="consult-price">
        <div class="left">
            <p class="img-wrap"><img src="http://img2.xcarimg.com/PicLib/s/s5087_420.jpg" alt=""></p>
            <div class="text-info">
                <span class="name">广汽废课-自由侠</span>
                <span class="price gray-price">1000.11-2939.22</span>
            </div>
        </div>
        <div class="right"><a href="javascript:" class="btn gray-btn">询底价</a></div>
    </div> -->
    <!-- 询底价 E -->
    <!-- 热门 -->
    <!-- <div class="hot-wrap">
        <div class="img-wrap">
            <img src="http://img2.xcarimg.com/PicLib/s/s5087_420.jpg" alt="">
        </div>
        <div class="name">北京运通博达汽车销售服务有限公司(北京分中心良心出品）</div>
        <div class="hot">热门</div>
    </div> -->
    <!-- 热门 end -->
</div>