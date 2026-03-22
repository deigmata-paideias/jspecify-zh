---
sidebar_position: 1
---

# 从这里开始

快速链接: [Release] | [GitHub] | [用户指南] | [Javadoc] | [规范] | [Wiki] | [FAQ] | [Issues] | [讨论]

## 这是什么？

[一群组织](/about)在搞一套 JVM 语言通用的 annotation 类型，用于静态分析和语言互操作。先做 nullness。

你会得到一个 annotation artifact（`org.jspecify.annotations` 包），外加精确的语义规范。

- **为什么要标准化 annotation？** 看[这个 Stack Overflow 回答][stackoverflow answer]——现状就是那么乱。

- **为什么要标准化语义？** 这样你不用纠结"让哪个工具开心"。

- **为什么一起做？** javadoc 就是该放这些信息的地方。

JSpecify 由 Java 静态分析领域的主要玩家共同开发。1.0.0 是第一个工具无关、库无关的正式版本。（`javax.annotation` 也试过，没成。）

背景故事见 [FAQ]。

## 学习 nullness

有问题翻 [Nullness Design FAQ]，或者直接[发邮件](mailto:jspecify-discuss@googlegroups.com)。

### 快速上手

- [用户指南]
- [Javadoc]——不是教程，但够细

### 想深入

- [规范][spec]——给编译器作者看的
- [Wiki][wiki]——约 20 篇随笔
- [Issues][issues]
- [试用](/docs/using)

### 参考实现

试试**[参考实现][reference implementation]**。它能验证你的 annotation 用法对不对，顺便让你感受下当前设计是顺手还是别扭（告诉我们！）。还在开发中，没完全符合规范。

## 参与

好问题。

现在加入完全不晚。1.0.0 之后，我们打算支持更多东西，不只是 nullness。

- 加 [Google Group]，打个招呼。问问题、吐槽、许愿。觉得你的组织该加入？自荐。

- 在用什么库觉得该支持 JSpecify？告诉它。

- 什么会让你用或不用 JSpecify？告诉我们。

- 提 [issue][file an issue]。（[参考实现][reference implementation]的问题[去那边提](https://github.com/jspecify/jspecify-reference-checker/issues/new)。）

- [GitHub][github] 上点个 Star。

## 1.0.0 之后

Spring Framework 7.0 的[公告][spring-announcement]说"null-safety 策略正在与 JSpecify 趋同"，还在 [issue][spring-migration-comment] 里解释了迁移原因，后来发了[博客][spring-blog-post]。

Moderne 用 [OpenRewrite](https://docs.openrewrite.org/) 大规模迁移 annotation，写了篇[指南](https://www.moderne.ai/blog/mass-migration-of-nullability-annotations-to-jspecify)。

InfoQ [采访了](https://www.infoq.com/news/2024/08/jspecify-java-nullability/) Spring 的 Jurgen Hoeller。

还有个[俄语视频](https://www.youtube.com/watch?v=CkAywkCby58&t=429s)聊到了我们。

[spring-announcement]: https://spring.io/blog/2024/10/01/from-spring-framework-6-2-to-7-0
[spring-migration-comment]: https://github.com/spring-projects/spring-framework/issues/28797#issuecomment-2387137015
[spring-blog-post]: https://spring.io/blog/2025/03/10/null-safety-in-spring-apps-with-jspecify-and-null-away
[discuss]: https://groups.google.com/g/jspecify-discuss
[file an issue]: https://github.com/jspecify/jspecify/issues/new
[github]: https://github.com/jspecify/jspecify
[google group]: https://groups.google.com/g/jspecify-discuss
[javadoc]: https://jspecify.dev/docs/api/org/jspecify/annotations/package-summary.html
[faq]: http://github.com/jspecify/jspecify/wiki/jspecify-faq
[nullness design faq]: https://github.com/jspecify/jspecify/wiki/nullness-design-FAQ
[issues]: https://github.com/jspecify/jspecify/issues
[release]: https://search.maven.org/artifact/org/jspecify/jspecify/1.0.0/jar
[reference implementation]: https://github.com/jspecify/jspecify-reference-checker
[spec]: /docs/spec
[stackoverflow answer]: https://stackoverflow.com/questions/4963300/which-notnull-java-annotation-should-i-use
[用户指南]: /docs/user-guide
[wiki]: https://github.com/jspecify/jspecify/wiki