---
sidebar_position: 3
---

# 该用 JSpecify annotation 吗？

JSpecify 1.0.0 发布了，我们保证向后兼容：不会改名、不会挪位置、不会搞破坏性更改。

但要不要现在开始用？看情况：

*   你的代码现在有 nullness annotation 吗？
*   你用的 nullness checker 支持 JSpecify 到什么程度？
*   有 Kotlin 用户吗？他们用什么编译器版本？
*   用 Dagger 之类的 annotation processor 吗？

## 还没用过 nullness annotation？

那就[开始用吧](/docs/using)。

就算暂时不上 nullness 分析器，光加 annotation 就有好处：

*   文档作用，告诉用户和维护者你的意图
*   依赖你库的项目能用它们自己的 nullness 分析器
*   以后要上 nullness 分析也更顺畅

特别是，如果你有 Kotlin 代码，或者 Kotlin 用户依赖你的代码，JSpecify annotation 会让 Kotlin 那边的类型更安全。新版 Kotlin 编译器能正确识别这些 annotation。

## 工具支持现状

几个主流 nullness 分析器已经支持 JSpecify 了（程度不一）：

*   [EISOP Framework](https://eisop.github.io/)：一致性不错，除了对 unspecified-nullness 代码的处理
*   [NullAway](https://github.com/uber/NullAway)：支持，但还不分析泛型
*   [IntelliJ IDEA](https://www.jetbrains.com/idea/)：支持，但泛型方面有些[问题](https://youtrack.jetbrains.com/issues/IDEA?q=%7Bjspecify%7D%20%23Unresolved)
*   [Checker Framework](https://checkerframework.org/)：认 `@Nullable` 和 `@NonNull`，但不认 `@NullMarked` 和 `@NullUnmarked`
*   [参考 checker](https://github.com/jspecify/jspecify-reference-checker)：基本正确，但不是为生产环境设计的

我们正在做[一致性测试套件](https://github.com/jspecify/jspecify/tree/main/conformance-tests)，让各工具能度量自己符合 JSpecify 规范的程度。

## Kotlin

Kotlin 有自己的 null-safe 类型系统，和 JSpecify 模型接近。但对未标注的 Java 代码，Kotlin 会当成"平台类型"，放宽一些检查。

好消息是 Kotlin 编译器能读懂 JSpecify annotation：

- 1.8.20 起：正确解释 `@Nullable` 和 `@NullMarked`
- 2.0.0 起：正确解释 `@NonNull`
- 2.0.20 起：正确解释 `@NullUnmarked`

[2.1.0][kotlin-2.1.0] 开始，Kotlin 默认把 JSpecify nullness 问题报成错误。想改成警告，加个 flag：`-Xnullability-annotations=@org.jspecify.annotations:warn`

[kotlin-2.1.0]: https://kotlinlang.org/docs/whatsnew21.html#change-of-jspecify-nullability-mismatch-diagnostics-severity-to-strict

## Dagger 等Annotation Processor

用 Dagger 之类会读 annotation 的 processor？可能要等能用 [JDK 22 构建](https://github.com/jspecify/jspecify/issues/537)再说。

JDK 22 之前的 `javac` 有个 bug（[JDK-8225377](https://bugs.openjdk.org/browse/JDK-8225377)），[type-use annotation](https://www.oracle.com/technical-resources/articles/java/ma14-architect-annotations.html) 从 class 文件读不对。JSpecify 的 `@Nullable` 和 `@NonNull` 受影响。JSR-305 和 AndroidX 的 annotation 是"声明 annotation"，不受影响——但正因如此，它们没法标注类型参数或数组元素。

JDK 22 修好了，但没 backport。如果你现在还得用旧版 `javac` 又依赖 Dagger，切到 JSpecify 可能会踩坑。详见 [issue 365](https://github.com/jspecify/jspecify/issues/365)，backport 进度跟踪 [JDK-8323093](https://bugs.openjdk.org/browse/JDK-8323093)。

[Dagger]: http://dagger.dev