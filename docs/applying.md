---
sidebar_position: 5
---

# 应用 JSpecify Nullness Annotations

如果你的代码没有 nullness annotation，我们建议从单个类或包开始，最好是依赖于尽可能少其他代码的那个。然后从被调用代码向外扩展到其调用者。

将来，我们会有关于可以自动化部分此过程的[工具的建议](https://github.com/jspecify/jspecify/issues/553)。

## 1. 查找 nullable 类型使用

查找类型的某些部分可能合理地为 `null` 的字段和方法返回类型及参数类型，并在那里添加 `@Nullable`。

阅读方法或字段的文档，看它是否记录了 `null` 是有效的。

在实现中查找线索。（注意这些是*线索*，而不是知道确切在哪里放置什么 annotation 的保证配方。有很多边缘情况和静态分析必然不完整的地方。）

*   方法中的 `return null;` 语句是方法返回类型为 nullable 的强烈信号！
*   方法中的 `if (parameter == null)` 测试是参数为 nullable 的强烈信号。
*   如果字段曾经直接赋值为 `null`，或赋值为可能为 `null` 的值，那是字段为 nullable 的信号。
*   如果你的代码将 `null` 或 nullable 值传递给自己的方法，那么这些参数也可能是 nullable 的。

### 泛型

带有类型参数的泛型类稍微复杂一些，因为你必须考虑是否应该允许用户应用 nullable 类型参数，然后是该类型变量在泛型类内的各个出现是否应该具有与类型参数不同的 nullness。

例如，如果你有 `class Foo<T>` 和方法 `Optional<T> bar(T t)`，你必须考虑用户拥有 `Foo<@Nullable String>` 是否有意义。如果合理，则用 `@Nullable` 标注该类型参数的边界。如果类型参数没有明显的边界（如 `class Foo<T>`），那么记住 `<T>` 实际上意味着 `<T extends Object>`，并将其更改为 `class Foo<T extends @Nullable Object>`。如果不合理，则保持边界为 non-nullable，然后用户将无法声明 `Foo<@Nullable String>`，除非他们的 nullness checker 向他们报告。

然后查找每个类型变量的各个使用，即使类型参数不是 nullable，也必须是 nullable 的。也许 `bar` 应该接受 `null`，即使对于 `Foo<@NonNull String>`。如果是这样，在该类型变量使用处添加 `@Nullable`：`bar(@Nullable T t)`。

如果类型参数的边界是 nullable，但你发现该类型变量的特定使用*不应*是 nullable，则在该类型变量使用本身添加 `@NonNull`。例如，你知道 `Optional` 的类型参数永远不能是 nullable，所以你会声明 `bar` 返回 `Optional<@NonNull T>` 以表示即使对于 `Foo<@Nullable String>` 它也返回 `Optional<String>`。

（还有其他边缘情况，如通配符。请参考[用户指南](/docs/user-guide)获取更多信息。）

## 2. 添加 `@NullMarked`

将 `@NullMarked` 添加到你正在标注的类或包，以指示剩余未标注的类型使用不是 nullable 的。

如果类或包的某些部分你还没准备好标注，可以使用 `@NullUnmarked` 让其未标注的类型使用保持 unspecified。

## 3. 在已标注代码上运行 nullness 分析

然后在刚刚标注的代码上运行支持 JSpecify 的 nullness 分析器。如果发现任何 nullness 问题，解决它们并重新运行：

*   也许你遗漏了一个 annotation：某些东西应该是 `@Nullable` 或 `@NonNull` 但没有标注？
*   也许你的实现代码需要一些 annotation（局部变量声明或转换表达式中的类型参数）？
*   也许你有静态分析无法判断某物是 null-safe 的情况，但你知道它是。例如，如果你调用一个你知道*对于这些参数*不会返回 `null` 的方法，你可能只是解引用返回值——但你的分析器可能仍然会抱怨。
    *   在这种情况下，使用 `@SuppressWarnings` annotation 抑制 nullness 错误是有意义的，并记录为什么你的逻辑无论如何都是安全的。
*   也许你的代码有一个实际的 nullness bug？如果是这样，标注代码帮助你发现了它！
    *   如果你现在无法修复 bug，你的 nullness 分析工具应该允许你使用 `@SuppressWarnings` annotation 或其他机制抑制错误，让你将这些作为 TODO 跟踪。
*   也许你的 nullness 分析器有 bug？（这最终不太可能，但有可能，特别是在我们完成一致性测试套件之前。）
    *   你应该能够使用 `@SuppressWarnings` annotation 抑制错误。然后向你的 nullness 分析器提交 bug，让他们知道这个问题。

如果可能，将此类或包上的 nullness 分析作为常规构建或 CI 设置的一部分打开，以防止回归。

## 4. 在调用代码上运行 nullness 分析

现在你已经使正在查看的类或包得到一致标注和检查，你必须确保那些新 annotation 没有在使用该代码的代码中发现 nullness 问题。这意味着直接依赖于你新标注的类的 Java 代码，并且已经被你的 nullness 分析覆盖，以及直接依赖于新标注类的 Kotlin 代码（如果你已启用 Kotlin 的 JSpecify 支持）。再次对该代码运行 nullness 分析并修复在那里报告的任何错误。你可能只需要在调用代码中进行更改，或者你可能发现必须在新标注的代码中更改 annotation。

## 5. 对新代码重复

找到下一个要标注的类或包，重复该过程，直到你的整个代码库都被分析并被 `@NullMarked` 覆盖。