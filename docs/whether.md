---
sidebar_position: 3
---

# 你应该在 Java 代码中使用 JSpecify annotation 吗？

随着 JSpecify 1.0.0 的发布，我们保证向后兼容性：我们不会重命名 annotation 或移动它们，也不会进行其他会导致你在更新时编译失败的更改。

然而，在决定是否开始在代码中使用 JSpecify annotation 时，还有其他事情需要考虑，至少包括：

*   如果你的 Java 代码还没有使用 nullness annotation，它应该使用！
*   当前版本的 nullness checker 对 JSpecify annotation 的支持程度如何？
*   你有 Kotlin 用户吗？他们使用哪个编译器版本？
*   你是否使用全程序 annotation processor，如 [Dagger]？

## 如果你的 Java 代码还没有使用 nullness annotation

如果你的 Java 代码还没有使用 nullness annotation，我们建议你[开始使用 JSpecify annotation](/docs/using)。

即使你当前没有使用 nullness 分析器，应用 JSpecify annotation 仍然可以带来好处。

*   annotation 是有用的文档，可以向用户和代码的未来维护者传达你的意图。
*   此外，直接依赖于你的库的项目将能够在上面运行*它们的* nullness 分析器。
*   最后，标注代码将使最终对你的代码库应用 nullness 分析的过程变得更容易。

特别是，如果你的项目包含 Kotlin 代码，或者 Kotlin 用户依赖于你的代码，JSpecify annotation 将改善使用你的 Java 库的 Kotlin 代码的 null-safety。新版本的 Kotlin 编译器能够[识别并正确解释](#kotlin)这些 annotation，因此 JSpecify 标注的 Java 代码在 Kotlin 中将具有正确的 nullness 类型。

## Nullness checker 对 JSpecify 的支持

几个主要的 Java nullness 分析器已经在一定程度上支持 JSpecify annotation。请查阅你的 checker 的官方文档，了解它们声称的当前和计划的 JSpecify 支持。

*   [EISOP Framework](https://eisop.github.io/) 具有良好的一致性，除了对 unspecified-nullness 代码（`@NullMarked` 作用域外的未标注代码）的解释。

*   [NullAway](https://github.com/uber/NullAway) 支持 JSpecify annotation，但尚不分析泛型。

*   [IntelliJ IDEA](https://www.jetbrains.com/idea/) 支持 JSpecify annotation，尽管它有一些[问题](https://youtrack.jetbrains.com/issues/IDEA?q=%7Bjspecify%7D%20%23Unresolved)，主要围绕泛型。

*   [Checker Framework](https://checkerframework.org/) 理解 `@Nullable` 和 `@NonNull`，但不理解 `@NullMarked` 或 `@NullUnmarked`。

*   JSpecify 的[参考 checker](https://github.com/jspecify/jspecify-reference-checker) 除了少数边缘情况外基本正确。虽然你可以试用它，但它不是为生产使用而设计的，也不旨在用户友好或高性能。

我们正在开发一个[一致性测试套件](https://github.com/jspecify/jspecify/tree/main/conformance-tests)，让任何 nullness 分析器都能测量和发布它们对 JSpecify 规范的符合程度。目前，只有 JSpecify 的参考 checker 和 EISOP Framework 已集成到我们的预发布测试套件中。

## Kotlin

Kotlin 有一个与 JSpecify 模型类似的 null-safe 类型系统。但 Kotlin 编译器将未标注的 Java 依赖解释为具有[平台类型](https://kotlinlang.org/docs/java-interop.html#null-safety-and-platform-types)，放宽了 Kotlin 否则会执行的一些 nullness 检查。然而，编译器理解 JSpecify annotation，能够使用它们让 Kotlin 代码在调用 Java 代码时看到 null-safe 类型。Kotlin 编译器从版本 1.8.20 开始正确解释 `@Nullable` 和 `@NullMarked`，从 2.0.0 开始正确解释 `@NonNull`，从 2.0.20 开始正确解释 `@NullUnmarked`。

从[版本 2.1.0][kotlin-2.1.0] 开始，Kotlin 编译器默认对使用 JSpecify nullness 发现的问题发出错误。要将这些更改为警告，请传递 `-Xnullability-annotations=@org.jspecify.annotations:warn` 标志。

[kotlin-2.1.0]: https://kotlinlang.org/docs/whatsnew21.html#change-of-jspecify-nullability-mismatch-diagnostics-severity-to-strict

## Annotation processor

如果你的项目依赖于在 classpath 中解释符号上的 nullness annotation 的 annotation processor，如 [Dagger]，那么你可能需要等到可以[使用 JDK 22 构建](https://github.com/jspecify/jspecify/issues/537)后才能采用 JSpecify annotation。在 JDK 22 之前的 `javac` 版本中存在一个 bug（[JDK-8225377](https://bugs.openjdk.org/browse/JDK-8225377)），[type-use](https://www.oracle.com/technical-resources/articles/java/ma14-architect-annotations.html) annotation（包括 JSpecify 的 `@Nullable` 和 `@NonNull`）没有从 class 文件中正确读取。相比之下，JSR-305 和 AndroidX nullness annotation 是"声明" annotation，因此不受此问题影响；然而，正因为如此，它们不能像 JSpecify 的那样应用于类型参数或泛型或数组类型的组件。

该问题从 JDK 22 开始已修复，但该修复尚未移植到旧版本的 `javac`。如果你无法使用 JDK 22+ `javac` 构建，并且你依赖于 Dagger 或其他类似的 annotation processor，你目前可能在切换到 JSpecify 的 annotation 时会遇到问题。请查看 [JSpecify issue 365](https://github.com/jspecify/jspecify/issues/365) 了解更多讨论，你可以在 [JDK-8323093](https://bugs.openjdk.org/browse/JDK-8323093) 中跟踪将该修复移植到旧版本 `javac` 的工作。

[Dagger]: http://dagger.dev