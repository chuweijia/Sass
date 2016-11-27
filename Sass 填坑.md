# Sass 填坑
* 中文注释报错  
D:\Ruby\lib\ruby\gems\2.3.0\gems\sass-3.4.22\lib\sass\engine.rb 进入修改编码方式为utf-8  
require 'sass/supports'  下添加
`Encoding.default_external = Encoding.find('utf-8')`  

* @each命令
  each命令必须在`类下`作为一个属性使用
```@requires_authorization
    @each $m in a,b{
      .#{$m}{ 
        background-image:url('/ss/#{$m}.jpg');
      }
   }
```  
* @extend  
这样写会报错 属性中只能写属性
```@requires_authorization
   .line{
      border:{
        color:red;
        width:100px;
        @extend .line;
      }
   }
``` 


