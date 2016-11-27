# CSS 填坑
* Flex布局  
  Android4.2.2 不支持换行  伪元素会有问题
  解决方案  
  Android 4.3- ` box-pack:start(defalut) | end | center | justify `  
  Android 4.3- ` box-align:start | end | center | baseline | stretch(default) `  
  grunt压缩编译后会合并相同属性名 所以改为sass-compressed解决 -->_flex.scss  
  
* Background 属性  
  `background:#000 url(image/a.png) no-repeat top right`  
  
  ```@requires_authorization
      width:10px;
      height:10px;
      background-size:cover; 等同于上两行写法
  ```  
  `background-size:0.25rem auto;`auto代表自适应icon的高度    
* 居中  
  此方法对display:block无效  
  
  ```@requires_authorization
      display:block;
      margin:0 auto;
  ```  

* 边距问题  

  ```@requires_authorization  
      仅限于margin  
      必须是block
      可用margin负值调节
  ```  
`padding` 是可以点击的  
* fontsize问题   
  ![image](http://7xsk2q.com1.z0.glb.clouddn.com/fz-1.png)  
  
* div+p 最亲的那个兄弟  
* label  
 label即使没有for 但是在作用域内也可以选  
* 文字  
  加间距也能居中的方法  
  
   ```@requires_authorization    
      text-indent 会在左边加缩进（+ -）  
      letter-spacing 会在每个字的右边加距离
   ```  
  关于一像素误差 为了适配手机（浏览器会有一像素误差 而手机不会有 尤其是iphone5)  
  
  ```@requires_authorization    
      vertical-align:top;
      margin-top:1px
  ```  
  shift+空格  全角占一个字节 这是强制文字拉距离  
* 清除浮动  
   ![image](http://7xsk2q.com1.z0.glb.clouddn.com/sassPro-27.png)  
* vertical-align 的问题  
   ![image](http://7xsk2q.com1.z0.glb.clouddn.com/sassPro-29.png)  
   图片底部未对其 则`vertial-align:bottom`
* 超出文字省略号  
 
   ```@requires_authorization      
      display:inline-block;  
      max-width:.9rem;
      white-space:nowrap;
      text-overflow:hidden;
      overflow:hidden;//出问题了 下面是解决方案
   ```  
   ![image](http://7xsk2q.com1.z0.glb.clouddn.com/sassPro-30.png)  
   iphone5例子证明 我们得用绝对定位  
* box-sizing 的问题  
    ![image](http://7xsk2q.com1.z0.glb.clouddn.com/sassPro-32.png)  
    
* chrome://inspect  
  chrome调试手机代码工具
* disabled 问题  
  ![image](http://7xsk2q.com1.z0.glb.clouddn.com/sassPro-36.png)  
* Math.round方法 四舍五入规则取整  
* 缓存  
  问题描述：断网时 走的缓存 期待加载出断网icon 所以一开始这icon就要`在页面加载时候作为节点被插入进去` 进入`缓存区`  
  ![image](http://7xsk2q.com1.z0.glb.clouddn.com/sassPro-40.png)  
* cookie localStorage sessionStorage  
  ![image](http://7xsk2q.com1.z0.glb.clouddn.com/vue/vuePro1.png)
* 手机rem即时缩进js  
  ![image](http://7xsk2q.com1.z0.glb.clouddn.com/sassPro-4.png)
*checkbox 问题  
  jq1.3- [checked]  
  新版本中 :checked  
  $().attr('checked')　返回值为`true`
  
 

  
  
  
