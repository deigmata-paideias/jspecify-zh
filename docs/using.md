---
sidebar_position: 4
---

# 使用 JSpecify Annotations

## 添加依赖

这些 annotation 可从 Maven Central 获取，坐标为
[`org.jspecify:jspecify:1.0.0`](https://repo1.maven.org/maven2/org/jspecify/jspecify/1.0.0/)。
annotation 本身位于 `org.jspecify.annotations` 包中。

以下是在 Maven、Gradle 或 Bazel 中添加依赖的代码片段。

无论你使用什么构建系统，避免配置你的构建向用户隐藏 JSpecify annotation。我们还建议在运行时包含这些 annotation，我们保持 JSpecify jar 很小以减少这样做的成本。每个构建工具支持不同的机制来隐藏 annotation 声明，我们在下面针对特定工具的指导中建议不要使用它们。

#### Maven

```xml
<dependency>
  <groupId>org.jspecify</groupId>
  <artifactId>jspecify</artifactId>
  <version>1.0.0</version>
</dependency>
```

避免使用 [`provided`] 或 [`optional`] scope。

#### Gradle

对于使用 `java-library` 或
[`com.android.library`](https://developer.android.com/studio/projects/android-library)
插件的项目，使用 `api` 配置而不是 [`implementation`] 或
[`compileOnlyApi`] 配置：

```groovy
dependencies {
  api("org.jspecify:jspecify:1.0.0")
}
```

或者，如果你使用的插件不支持 `api` 配置，比如 `java` 插件：

```groovy
dependencies {
  implementation("org.jspecify:jspecify:1.0.0")
}
```

#### Bazel

```python
maven_jar(
    name = "jspecify",
    artifact = "org.jspecify:jspecify:1.0.0",
    sha256 = "1fad6e6be7557781e4d33729d49ae1cdc8fdda6fe477bb0cc68ce351eafdfbab",
)
```

## 切换到 JSpecify nullness annotation

### 如果你的代码没有 nullness annotation

如果你的代码还没有使用 nullness annotation，现在就是最好的时机！我们有一个推荐的高层[策略](/docs/applying)。

### 如果你的代码已经使用 JSR-305 annotation

在从 JSR-305 annotation 迁移到 JSpecify annotation 之前，看看关于 [annotation processors](/docs/whether#annotation-processors) 的注意事项是否适用于你的情况。

从 JSR-305 annotation 迁移主要包括更改导入、更新 annotation 名称和位置，以及解决构建错误。JSpecify 的 annotation 是类型使用 annotation，这对它们的放置位置施加了额外的限制。在某些情况下，这些限制可能使它们的放置与现有 JSR-305 annotation 的放置不兼容。我们建议采取以下迁移步骤：

1.  更新导入以使用 JSpecify annotation。

1.  检查数组类型上的*所有* annotation。当前类型为 `@Nullable Object[]` 的任何代码必须更改为 `Object @Nullable []`。这个更改是[type-use annotations]语法要求的。如果你*不*做这个更改，你的代码将从"可 null 的对象数组"变为"nullable 对象的数组"。

1.  重新构建项目，根据需要进行更改以纠正构建错误。构建错误可能源于放置类型使用 annotation 的限制。如果你看到关于"scoping construct"上的 annotation 的错误，必须将 annotation 移动到简单类型名称之前。例如，将 `@Nullable Map.Entry<K, V>` 更改为 `Map.@Nullable Entry<K, V>`。

1.  可选地，[移动其他 annotation 以符合风格指南](https://google.github.io/styleguide/javaguide.html#s4.8.5-annotations)，但这不是语言要求的。（在启用[patching](https://errorprone.info/docs/patching)的情况下运行 [AnnotationPosition](https://errorprone.info/bugpattern/AnnotationPosition) Error Prone 检查可以帮助进行这些更改。）

#### 默认 annotation

除了采用 JSpecify 的 `@Nullable` 和 `@NonNull` annotation 外，你可能还希望采用 `@NullMarked`。如果你的代码已经标注了所有 `@Nullable` 类型，那么你可以（除了罕见的[例外](https://jspecify.dev/docs/api/org/jspecify/annotations/NonNull.html#projection)）删除任何 `@NonNull` annotation，转而在整个类、包或模块上添加 `@NullMarked` annotation。

`@NullMarked` 类似于 JSR-305 的 [`@ParametersAreNonnullByDefault`] 和自定义 [`@TypeQualifierDefault`] annotation。不过，`@NullMarked` 与那些不同，包括[对泛型的影响](/docs/user-guide#generics)，所以你可能需要利用你在类型参数等位置进行标注的新能力（如 `Future<@Nullable Credentials>`）。`@NullMarked` 可能更接近你想要的效果，但可能需要你做额外的工作。

### 如果你的代码已经使用 Checker Framework annotation

在从 Checker Framework annotation 迁移到 JSpecify annotation 之前，看看上面关于 [Kotlin][Kotlin-caveats] 的注意事项是否适用于你的情况。

从 Checker Framework 的 `@Nullable` 和 `@NonNull` 迁移到 JSpecify 的等效项就像切换导入一样简单。

但请注意，JSpecify 和 Checker Framework 都提供对方没有的 annotation。如果你在项目上使用 Checker Framework Nullness Checker，你最终可能会混合使用 annotation：

*   JSpecify annotation 旨在涵盖公共 API 中常用且被工具广泛支持的功能。特别是，你可以使用 `@NullMarked` annotation 向 Kotlin 等工具表明[你的大多数 API 类型是 non-nullable](https://jspecify.dev/docs/api/org/jspecify/annotations/NullMarked.html#effects)，完全支持泛型，且无需在构建期间运行 Checker Framework 的字节码重写。

    *   如果你的代码已经通过 Checker Framework 的检查，那么你通常可以将其标注为 `@NullMarked`，只需再做一处更改：如果你声明任何类型参数而没有声明边界（如 `class Foo<T>`），你必须将其更改为声明 nullable 边界（`class Foo<T extends @Nullable Object>`），如果你想继续能够将它们与 nullable 类型参数一起使用。

*   Checker Framework 提供了其他工具大多未识别的额外 annotation。如果项目由 Checker Framework 检查，或者其用户由 Checker Framework 检查，该项目可以从这些 annotation 中受益。在这些情况下，annotation 可以让你表达更复杂的契约，例如哪些方法在对象初始化期间调用是安全的。

简而言之：如果你只需要 `@Nullable`、`@NonNull` 和 `@NullMarked`，那么你可能更愿意完全切换到 JSpecify。否则，你可能选择同时使用 Checker Framework annotation（用于 `@MonotonicNonNull` 等 annotation）和 JSpecify（用于 `@NullMarked` 等 annotation）。

[`@ParametersAreNonnullByDefault`]: https://www.javadoc.io/doc/com.google.code.findbugs/jsr305/3.0.1/javax/annotation/ParametersAreNonnullByDefault.html
[`@TypeQualifierDefault`]: https://github.com/Kotlin/KEEP/blob/master/proposals/jsr-305-custom-nullability-qualifiers.md#type-qualifier-default
[`compileOnlyApi`]: https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_configurations_graph
[`implementation`]: https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_configurations_graph
[`optional`]: https://maven.apache.org/guides/introduction/introduction-to-optional-and-excludes-dependencies.html
[`provided`]: https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#dependency-scope
[Kotlin-caveats]: /docs/whether#kotlin
[type-use annotations]: https://www.oracle.com/technical-resources/articles/java/ma14-architect-annotations.html#:~:text=Applying%20Type%20Annotations