# 工具一致性

本文档旨在阐明如何描述 JSpecify 规范对实际 Java 代码的含义，以便我们可以在文档、规范、issue 和讨论中谈论它。JSpecify 发布了特定的 annotation，它们在 Java 代码中的存在具有精确的语义，这种语义与分析 Java 代码并向用户报告内容的工具相关，但 *JSpecify 不要求工具在任何特定情况下向用户发出任何特定的错误或消息*。

重要的是不要以暗示工具必须报告特定错误的方式谈论 JSpecify，但我们确实必须谈论 JSpecify 的规则如何影响 Java 代码的含义，包括会导致*某些*工具在某些情况下报告错误的方式。

更广泛地说，JSpecify 规范添加了关于 Java 代码的信息，超出了语言规范的内容。我们需要一种方式来描述 JSpecify 添加到代码的信息，而不必我们就该信息是否代表问题或该信息应如何传达给用户做出判断。

JSpecify 的[规范](/docs/spec)由增强类型系统组成，包括子类型规则，以及一组根据包围该类型使用的 annotation 确定类型使用的增强类型的规则。规范使用"UNION_NULL"、"null-marked scope"、"multiple worlds"和"nullness-subtype-establishing paths"等术语；它大多没有明确谈论这对 Java 代码示例意味着什么。然而，规范的重点是暗示关于实际 Java 代码的事情。

这是一个问题的例子：假设根据 JSpecify，方法 `a(...)` 的参数具有 non-nullable 类型，方法 `b()` 具有 nullable 返回类型。描述这种情况的一种自然方式是说工具应该报告代码 `a(b())` 有问题。然而，工具可能不报告此类问题有很多充分理由，包括使用非 JSpecify annotation 或其他信息表明这个对 `b()` 的特定调用不返回 null。

> **注意：** 由于 nullness 是 JSpecify 的初始领域，本文档中的所有示例都以该领域的方式表述。然而，本文档旨在阐明我们将描述所有领域 JSpecify 一致性的方式。

提议是，我们应该通过创建关于实际 Java 代码的可枚举问题列表来谈论 JSpecify 对 Java 代码示例的影响，这些问题可以通过查阅规范来回答。问题集将随着规范的增长而增长。

问题如下：

> **注意：** 每个问题的示例并非详尽无遗。

1.  给定的 JSpecify annotation 在其上下文中是被识别还是未被识别
    ([type-use][spec-locations], [declaration][spec-locations])？

    *   未识别: `@Nullable int`
    *   未识别: `class Foo<@NonNull T extends Foo>`
    *   已识别: `void foo(@Nullable Bar bar)`

1.  给定类型使用的 [null-augmented type][spec-locations] 是什么，
    仅基于它或周围作用域上的 JSpecify annotation？

    ```java
    @NullMarked
    interface A {
      Foo method1();

      @NullUnmarked
      void method2(Foo arg);
    }
    ```

    *   `method1` 返回类型 `Foo!`
    *   `method2` 接受类型 `Foo*`

1.  [expression] 或 [expression context] 的 null-augmented type 是什么，
    从它引用的符号的 null-augmented type 派生，
    仅基于那些符号或周围作用域上的 JSpecify annotation？

    *   `Optional.ofNullable(nullableString)` 接受 `String?` 并返回
        `Optional!<String!>`

1.  给定表达式是否表示在某些或所有 [worlds](/docs/spec#multiple-worlds) 中对 nullable 表达式的解引用，
    从其引用的 null-augmented type 派生，
    仅基于那些符号或周围作用域上的 JSpecify annotation？

    *   `map.get(key).hashCode()` 中对 `hashCode()` 的调用是对所有 worlds 中 nullable 表达式的解引用（因为 `Map.get()` [被标注为返回 `@Nullable`][Map.get]）
    *   `returnsUnspecified().hashCode()` 中对 `hashCode()` 的调用是对某个 world 中 nullable 表达式的解引用（如果 `returnsUnspecified()` 返回 `null`）

1.  给定表达式或类型参数是否在某些或所有 worlds 中不是其上下文的 [nullness subtype](/docs/spec#nullness-subtyping)，
    从它们引用的符号的 null-augmented type 派生，
    仅基于那些符号或周围作用域上的 JSpecify annotation？

    *   `acceptsNonNull(returnsUnspecified())`: 参数 `returnsUnspecified` 在某个 world 中不是 `acceptsNonNull` 的 nullness subtype（如果 `returnsUnspecified()` 返回 `null`）
    *   `acceptsNonNull(returnsNullable())`: 参数 `returnsNullable` 在所有 worlds 中不是 `acceptsNonNull` 的 nullness subtype

1.  给定参数的类型是否在某些或所有 worlds 中是被覆盖方法相应参数的正确 nullness 子类型（nullness-covariant）？

    *   `foo(@NonNull String)` 覆盖 `foo(@Nullable String)`: 覆盖方法中 `foo` 的参数在所有 worlds 中是 nullness 子类型

1.  给定参数的类型是否在某些或所有 worlds 中是被覆盖方法相应参数的正确 nullness 超类型（nullness-contravariant）？

    *   `bar(@Nullable String)` 覆盖 `bar(@NonNull String)`: 覆盖方法中 `bar` 的参数在所有 worlds 中是 nullness 超类型

1.  给定方法的返回类型是否在某些或所有 worlds 中是被覆盖方法返回类型的正确 nullness 子类型（nullness-covariant）？

    *   `@NonNull String foo()` 覆盖 `@Nullable String foo()`: 覆盖方法中 `foo` 的返回类型在所有 worlds 中是 nullness 子类型

1.  给定方法的返回类型是否在某些或所有 worlds 中是被覆盖方法返回类型的正确 nullness 超类型（nullness-contravariant）？

    *   `@Nullable String bar()` 覆盖 `@NonNull String bar()`: 覆盖方法中 `bar` 的返回类型在所有 worlds 中是 nullness 超类型

1.  [更多问题待定]

注意这些问题的表述方式不要求工具报告错误。

## 一致性测试

JSpecify 发布一致性测试，工具可以用它们来测量与这些问题的一致性。一致性测试由代表对上述问题关于特定 Java 代码和符号示例的回答的断言组成。为工具运行一致性测试包括确保工具能够以 JSpecify 规范要求的方式回答这些问题。

注意通过这些一致性测试的工具仍然可以为其用户做出任何行为。例如，能够正确回答参数是其相应被覆盖方法参数的正确 nullness 超类型的工具可能永远不会向用户报告该事实。另一个例子是，工具可以使用额外信息推断根据 JSpecify 是 nullable 的引用实际上是非 null 的，因此报告其解引用是安全的，所有这些都不影响其对 JSpecify 的一致性。

[expression context]: https://docs.google.com/document/d/1nbTnJ0-HubLnQPKSjK5CDZyoe6Al64vdlkoJxaYX9XY/preview?resourcekey=0-ADjPZnp8LN3dRX_ptjlagw&tab=t.0#bookmark=kix.w6xfjhkftb9r
[expression]: https://docs.google.com/document/d/1nbTnJ0-HubLnQPKSjK5CDZyoe6Al64vdlkoJxaYX9XY/preview?resourcekey=0-ADjPZnp8LN3dRX_ptjlagw&tab=t.0#bookmark=kix.2r97mw74ac6r
[Map.get]: https://github.com/jspecify/jdk/blob/b7435cff373c527aad82a062c5605f6f9c1bb0de/src/java.base/share/classes/java/util/Map.java#L255
[spec-locations]: /docs/spec#recognized-locations-for-declaration-annotations