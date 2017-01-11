 # Sass安装篇  
## sass原生编译
sass compass基于`ruby环境` 安装最新版ruby  
http://rubyinstaller.org/downloads/  
安装时自动配置好了环境变量 查看配置  
`ruby -v`  
`gem -v`  
`gem install sass`  
![image](http://7xsk2q.com1.z0.glb.clouddn.com/ruby-2.png)  
原因是非安全链接 `gem sources -a http://rubygems.org/` [y/n]写 `Y`!!  
`compass init`生成三个子目录  || `compass create myCompass`
* `config.rb`  
* `sass`        
* `stylesheets`        

配置文件可以配置`compass`的编译方式 (因为前面是compass init生成的)  
`sass test.scss || sass test.scss test2.css ` dos中`原生编译`方法  
## sublime快捷编译  
>以下操作针对于sublime text3快捷方式  

插件  
* `Sass`  
* `SASS Build`  
* `SublimeOnSaveBuild`将 ctrl + s && ctrl + b  --> ctrl + s  
查看`Tools-->Build System` 生成了 `SASS` 和 `SASS-Compressed`(压缩)两种编译模式  
`PackageResourceViewer` 快捷方式 `ctrl+shift+p` --> `open source` 可以打开 上述两个插件的配置文件`xx.sublime-build`  
![image](http://7xsk2q.com1.z0.glb.clouddn.com/sassPro-33.png)  
可以自定义编译映射路径 编译`sass`快捷方式 `ctrl+s` 于是**挖坑**从这里开始..  

### compass
* 关系  
sass \ compass ~ js \ jq 
* 引入  
`compass -v`
`@import 'compass'` 在sass文件中引入compass库  
`@import '_testsass' 可以混用
* 编译  
`compass compile` **会将sass 和 compass库同时编译！**  
`ctrl+s` **只会编译sass 这是sass插件导致的**  
`config.rb` 中 output_style:compressed 压缩属性针对于compass而言  上图  
![image](http://7xsk2q.com1.z0.glb.clouddn.com/sassPro-20.png)  
![image](http://7xsk2q.com1.z0.glb.clouddn.com/sassPro-22.png)  
所以下一步考虑 安装可以`自动编译compass`的插件  










