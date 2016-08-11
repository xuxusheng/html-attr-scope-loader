# html-attr-scope-loader

webpack的自定义loader模块，给html文件中标签加入自定义属性以起到隔离作用域的作用，依赖于 css-attr-scope-loader

---

### 一、expmale：

html文件：

```html
<link href="./index.scss">
<link href="./index.css">
<div>
    <ul>
        <li><p></p></li>
    </ul>
</div>
```

css文件：

```css
div {}

.title {}

div.demo {}

div.wrap ul.list li.item {}

.hover:hover {}

.after::after {}

div#article > ul::before ~ li, .xusheng::after, .xu > .sheng::before {}
```

**转换后：**

html 文件：

```html
<div _7c1ac95d75>
    <ul _7c1ac95d75>
        <li _7c1ac95d75><p _7c1ac95d75></p></li>
    </ul>
</div>
```

css 文件：

```css
div[_7c1ac95d75] {}

.title[_7c1ac95d75] {}

div.demo[_7c1ac95d75] {}

div.wrap[_7c1ac95d75] ul.list[_7c1ac95d75] li.item[_7c1ac95d75] {}

.hover:hover[_7c1ac95d75] {}

.after[_7c1ac95d75]::after {}

div#article > ul[_7c1ac95d75]::before ~ li[_7c1ac95d75], .xusheng[_7c1ac95d75]::after, .xu[_7c1ac95d75] > .sheng[_7c1ac95d75]::before {}
```

---

### 二、参数：

```javascript
loader: 'html-attr-scope?scopeLen=10'
```

**scopeLen:** 表示所生成的自定义属性（hash值）的长度，默认为10，可以省略。

---

### 三、使用方法：

#### 1. 基本使用

webpack 的 loader 肯定是要结合 webpack 来使用。

> 默认采用 postcss 来支持 scss， 所有先要在 webpack 中配置好 postcss 以及其对 scss 的支持。

首先在 webpack.config.js 文件中设置如下：

```javascript
config.module = {
    loaders: [{
        test: /\.html$/,
        loader: 'html-attr-scope-loader'
    }]
}
```

当引入了 html-attr-scope-loader 之后，对 css 的引入即可不再通过在 js 文件中采用 `require('./xxx.css')` 的方式。

在 html 文件中，加入 `<link href='./xxx.css'>` 标签即可。

默认支持 scss 文件，也是直接采用 `<link href='./xxx.scss'>` 标签即可。

html 文件和其所引入的 css 文件会被标记上同样的自定义属性`[_xxxxxxxxxx]`，达到隔离的作用，防止不同模块间样式冲突。

> 第三方库的样式文件可以继续使用 require() 的方式引入。

#### 2. 全局样式

默认会将 css/scss 中的所有选择器都加上自定义属性，这样会使所有的规则都模块化。

但是如果希望某一个选择器不被模块化怎么办？

在 scss文件中使用 `:global` 即可：

如：

```css
:global(.xusheng) .xu > .sheng {}

:global {
    .xu { }
    .sheng { }
}
```

会变为：

```css
.xusheng .xu[_xxxxxxxxxx] > .sheng[_xxxxxxxxxx] {}

.xu {}
.sheng {}
```

---

### 四、注意事项：

1. html 文件中的 link 标签会被移除。

2. html 文件中每一个标签都会被加上自定义属性。

3. css 文件中选择器后面会被加上相应的属性选择器。

4. 如果选择器有多级的话，那么只会在每一级的最后面加上一个属性选择器，同样的，如果这一级存在ID选择器的话，就不会再在末尾加上属性选择器，例如：
 `.xuxusheng > .xusheng.sheng {}` 
 会变为
 `.xusheng[_xxxxxxxxxx] > .xusheng.xu[_xxxxxxxxxx]`，
 而
 `.xuxusheng > #xusheng.sheng {}` 
 会变为 
 `.xuxusheng[_xxxxxxxxxx] > #xusheng.sheng {}`。

5. 如果在伪元素后面加上属性选择器的话，样式会失效，如
 ```css
 .xusheng::after[_xxxxxxxxxx] {}
 ```
 所以在遇到伪元素的时候，会将属性选择器向前移动一位，不在最后，如：`.xusheng[_xxxxxxxxxx]::after`。因为对伪类以及伪元素的判定是基于一个冒号还是两个冒号的，所以在使用伪元素时尽量使用规范的两个冒号，尽管一个冒号浏览器也可以识别。

---

### 五、QA:

1. 自定义属性具体是通过什么来决定的？

答：当在 js 文件中 `require('./xxx.html')` 时，在 `html-attr-scope-loader` 中会使用 `nodejs` 的 `crypto` 模块，根据当前 html 文件中的字符串生成一串 `hash `值，此值前面在加上下划线之后即为自定义属性。

2. 为什么自定义属性前面要加上下划线？

答：因为如果不加下划线的话，有时候生成的hash值会是数字开头的，而 html 中采用数字开头的自定义属性是 invalid 的。

