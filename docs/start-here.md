---
sidebar_position: 1
---

# 从这里开始

快速链接: [Release] | [GitHub] | [用户指南] | [Javadoc] | [规范] | [Wiki] |
[FAQ] | [Issues] | [讨论]

## 这是什么？

[一群组织](/about)正在合作定义一组用于 JVM 语言的通用 annotation 类型，以改善静态分析和语言互操作。我们最初的重点是 nullness 分析。

这包括提供你的代码可以依赖的 annotation 类型 artifact（在 `org.jspecify.annotations` 包中），以及对其语义的*精确*规范。

*   **为什么要标准化 annotation？** 因为你值得比这个悲剧性的 [stackoverflow 回答] 所描绘的更好的东西。

*   **为什么要标准化语义？** 因为你值得拥有关于代码应如何被 annotation 的单一事实来源，而不必在满足哪个工具之间做出选择。

*   **为什么要两者一起做？** 因为你值得在 annotation 类的 javadoc 中轻松找到这些信息。

JSpecify 由 Java 静态分析领域的主要利益相关者通过共识开发。我们的 1.0.0 版本是这些 annotation 的首个工具无关、库无关的 artifact。（注意：`javax.annotation` 是对此的一次尝试，但从未达成共识，也从未真正发布。）

在 JSpecify [FAQ] 中了解更多关于 JSpecify 组织及其目标的信息。

## 如何了解你们的 nullness 支持？

这里有一些链接。在阅读过程中，你可能会有很多"为什么？"的问题，你可以在 [Nullness Design FAQ] 中寻找答案。如果你愿意，可以[给我们发邮件](mailto:jspecify-discuss@googlegroups.com)。

### 从以下任一开始

*   [用户指南]。
*   [Javadoc]，它不是*教程*式的 walkthrough，但非常详尽和具体。

### 如果你*真的*很感兴趣

*   [规范文档][spec]，是为编译器和静态分析工具的开发者编写的。
*   我们的 [wiki] 有大约 20 篇关于各种主题的非正式、非规范性文章
*   开放的 [issues]
*   [试用一下](/docs/using)

### 参考实现

*   请试用我们的**[参考实现][reference implementation]**。这让你能够根据我们定义的语义验证你对 annotation 的使用，这时你才会真正发现我们当前的设计选择对你来说是有帮助还是令人烦恼（请告诉我们！）。不过，这个工具仍在开发中，尚未完全符合我们自己的规范。

## 如何参与？

好问题。

现在参与还不晚！在我们的 1.0.0 发布后，我们计划将支持扩展到 nullness 之外。

*   加入我们的 [Google Group]。介绍一下自己！提问、抱怨，或者告诉我们你想看到什么。如果你的组织应该成为我们组织的成员，请介绍你们自己并自我提名。

*   你是否使用任何你认为应该使用/支持 JSpecify annotation 的库或工具？请告诉他们我们的存在！

*   思考一下什么因素会让你的项目更可能或更不可能采用 JSpecify，并告诉我们。

*   [提交 issue][file an issue] 来请求功能或报告问题。（如果[参考实现][reference implementation]有问题，[在其仓库中提交 issue](https://github.com/jspecify/jspecify-reference-checker/issues/new)。）

*   Star 并 Watch 我们的 [github] 仓库。

## 媒体报道

自从我们[发布 1.0.0 版本](/blog/release-1.0.0)以来，我们在社区中看到了一些积极的反响。这里有一些有趣的帖子、文章和视频：

*   2025 年 11 月发布的 Spring Framework 7.0 已经[发布公告][spring-announcement]，公告中提到其"null-safety 策略正在与最近发布的 JSpecify annotation 趋同"。这个 [GitHub issue 评论][spring-migration-comment]列出了他们迁移工作的一些原因，Spring 后来发布了一篇关于这项工作的[博客文章][spring-blog-post]。

*   [Moderne 大规模迁移了其 nullness annotation](https://www.moderne.ai/blog/mass-migration-of-nullability-annotations-to-jspecify)，并发布了一份指南，解释了他们如何使用 [OpenRewrite](https://docs.openrewrite.org/) 自动化重构平台来完成这项工作。

*   InfoQ 的 Ben Evans [撰文介绍了这次发布](https://www.infoq.com/news/2024/08/jspecify-java-nullability/)，并采访了 Spring Framework 的联合创始人和项目负责人 Jurgen Hoeller。

*   一段关于 Java/JDK 领域最新消息的俄语视频概述包括[对 JSpecify 的讨论](https://www.youtube.com/watch?v=CkAywkCby58&t=429s)。

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
[release]: https://search.maven.org/artifact/org.jspecify/jspecify/1.0.0/jar
[reference implementation]: https://github.com/jspecify/jspecify-reference-checker
[spec]: /docs/spec
[stackoverflow answer]: https://stackoverflow.com/questions/4963300/which-notnull-java-annotation-should-i-use
[用户指南]: /docs/user-guide
[wiki]: https://github.com/jspecify/jspecify/wiki