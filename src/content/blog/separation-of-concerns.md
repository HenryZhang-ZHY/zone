---
title: 'Separation of Concerns'
description: ''
pubDate: 2025-05-31
updatedDate: 2025-06-02
---

**关注点分离**（Separation of Concerns，简称 **SoC**）是一种思考方式，主张不要同时处理问题的多个方面，而是集中精力深入研究某一特定方面，有意识地将其他方面暂时搁置。[^1]

在程序设计领域，关注点分离是一种被广泛应用的设计原则。从不同的关注点出发，将系统划分为多个相对独立的模块，可以显著降低系统的复杂性，同时提高系统的可维护性和可扩展性。[^2]

以网页开发为例，我们通常使用 HTML 组织文档内容，用 CSS 控制样式风格，它们一般位于不同文件中。这种分离使得内容和样式相互独立，便于单独修改和维护。

```css
.highlight {
    color: red;
    font-size: 18px;
}
.reference {
    color: grey;
    font-size: 16px;
}
```

```html
<p class="highlight">Neque porro quisquam</p>
<ul>
    <li class="highlight">qui dolorem ipsum quia</li>
    <li class="reference">consectetur, adipisci</li>
</ul>
```

如果不遵循关注点分离原则，代码可能会变成这样：

```html
<p style="color: red; font-size: 18px;">Neque porro quisquam</p>
<ul>
    <li style="color: red; font-size: 18px;">qui dolorem ipsum quia</li>
    <li style="color: grey; font-size: 16px;">consectetur, adipisci</li>
</ul>
```

在这种情况下，样式代码直接嵌入 HTML 中，导致可读性和可维护性变差。样式和结构紧密耦合也导致难以复用样式，需要修改样式时，必须在 HTML 内容中逐个查找并修改 `style` 属性。

陈皓经常在他的文章中提到的“业务逻辑和控制逻辑分离”其实就是一种关注点分离的实践。[^3] [^4] [^5]

## 参考资料

[^1]: [E.W. Dijkstra Archive: On the role of scientific thought (EWD447)](https://www.cs.utexas.edu/~EWD/transcriptions/EWD04xx/EWD447.html)

[^2]: [Separation of Concerns - Wikipedia](https://en.wikipedia.org/wiki/Separation_of_concerns)

[^3]: [我做系统架构的一些原则 | 酷 壳 - CoolShell](https://coolshell.cn/articles/21672.html#%E5%8E%9F%E5%88%99%E4%B8%83%EF%BC%9A%E5%AF%B9%E6%8E%A7%E5%88%B6%E9%80%BB%E8%BE%91%E8%BF%9B%E8%A1%8C%E5%85%A8%E9%9D%A2%E6%94%B6%E5%8F%A3)

[^4]: [HTTP的前世今生 | 酷 壳 - CoolShell](https://coolshell.cn/articles/19840.html#HTTP_09_10)

[^5]: [Go编程模式：Map-Reduce | 酷 壳 - CoolShell](https://coolshell.cn/articles/21164.html#%E4%B8%9A%E5%8A%A1%E7%A4%BA%E4%BE%8B)
