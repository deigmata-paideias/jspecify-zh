---
sidebar_position: 2
---

# Nullness 用户指南

在 Java 代码中，表达式是否可能求值为 `null` 通常只用自然语言文档记录（如果有的话）。JSpecify 的 nullness annotation 让程序员能够以一致且定义明确的方式表达 Java 代码的 nullness。

JSpecify 定义了描述 Java 类型是否包含 `null` 值的 annotation。这类 annotation 对以下场景很有用：

*   阅读代码的程序员，
*   帮助开发者避免 `NullPointerException` 的工具，
*   执行运行时检查和测试生成的工具，以及
*   文档系统。

## Java 变量是引用

在 Java 中，所有非原始类型变量要么是 `null`，要么是对对象的引用。我们通常认为 `String x` 这样的声明意味着 `x` 是一个 `String`，但实际上它意味着 `x` *要么*是 `null`，*要么*是对实际 `String` 对象的引用。JSpecify 让你能够清楚地表达你是否真的意味着前者，还是你真的意味着 `x` 一定是对 `String` 对象的引用而不是 `null`。

## 类型和 nullness

JSpecify 提供了规则来确定每个类型使用具有四种 nullness 中的哪一种：

1.  它可以包含 `null`（它是"nullable"）。
2.  它不会包含 `null`（它是"non-nullable"）。
3.  仅对于类型变量：如果替换它的类型参数包含 `null`，则它也包含 `null`（它具有"parametric nullness"）。
4.  我们不知道它是否可以包含 `null`（它具有"unspecified nullness"）。这相当于没有 JSpecify annotation 时的状态。

对于给定的变量 `x`，如果 `x` 可以是 `null`，那么 `x.getClass()` 是不安全的，因为它可能产生 `NullPointerException`。如果 `x` 不能是 `null`，`x.getClass()` 永远不会产生 `NullPointerException`。如果我们不知道 `x` 是否可以是 `null`，我们也不知道 `x.getClass()` 是否安全（至少就 JSpecify 而言）。

"不能是 `null`"的概念实际上应该带有一个脚注，说明"如果相关代码都不涉及 unspecified nullness"。例如，如果你有一些代码将具有 unspecified nullness 的类型传递给只接受 `@NonNull` 参数的方法，那么工具可能会允许它将可能为 `null` 的值传递给期望"不能是 `null`"参数的方法。

有四个 JSpecify annotation 一起使用来指示所有类型使用的 nullness：

*   两个类型使用 annotation，指示特定类型使用是否包含 `null`：[`@Nullable` 和 `@NonNull`](#nullable-和-nonnull)
*   一个作用域 annotation，让你在大多数情况下不必输入 `@NonNull`：[`@NullMarked`](#nullmarked)
*   另一个作用域 annotation，撤销 `@NullMarked` 的效果，以便你可以增量采用 annotation：[`@NullUnmarked`](#nullunmarked)

## `@Nullable` 和 `@NonNull`

当类型被 [`@Nullable`] annotation 标注时，意味着该类型的值可以是 `null`。`@Nullable String x` 意味着 `x` 可能是 `null`。使用这些值的代码必须能够处理 `null` 情况，并且可以将 `null` 赋给此类变量或将 `null` 传递给这些参数。

当类型被 [`@NonNull`] annotation 标注时，意味着该类型的任何值都不应该是 `null`。`@NonNull String x` 意味着 `x` 永远不应该是 `null`。使用这些值的代码可以假设它们不是 `null`，将 `null` 赋给这些值或将 `null` 传递给这些参数是个坏主意。（参见[下文](#nullmarked)了解如何在大多数情况下不必写出 `@NonNull`。）

```java
static @Nullable String emptyToNull(@NonNull String x) {
  return x.isEmpty() ? null : x;
}

static @NonNull String nullToEmpty(@Nullable String x) {
  return x == null ? "" : x;
}
```

在这个例子中，`emptyToNull` 的参数被 `@NonNull` 标注，所以它不能是 `null`；`emptyToNull(null)` 不是有效的方法调用。`emptyToNull` 方法的主体依赖于这个假设，并立即调用 `x.isEmpty()`，如果 `x` 实际上是 `null`，这会抛出 `NullPointerException`。相反，`emptyToNull` 可能返回 `null`，所以它的返回类型被 `@Nullable` 标注。

另一方面，`nullToEmpty` 承诺处理 `null` 参数，所以它的参数被 `@Nullable` 标注，表示 `nullToEmpty(null)` 是有效的方法调用。它的主体考虑了参数是 `null` 的情况，不会抛出 `NullPointerException`。它不能返回 `null`，所以它的返回类型被 `@NonNull` 标注。

```java
void doSomething() {
  // OK: nullToEmpty 接受 null 但不会返回它
  int length1 = nullToEmpty(null).length();

  // 不OK: emptyToNull 不接受 null；而且，它可能返回 null！
  int length2 = emptyToNull(null).length();
}
```

工具可以使用 `@Nullable` 和 `@NonNull` annotation 来警告用户不安全的调用。

就 JSpecify 而言，`@NonNull String` 和 `@Nullable String` 是*不同的类型*。`@NonNull String` 类型的变量可以引用任何 `String` 对象。`@Nullable String` 类型的变量也可以，但它还可以是 `null`。这意味着 `@NonNull String` 是 `@Nullable String` 的*子类型*，就像 `Integer` 是 `Number` 的子类型一样。一种看待这个问题的方式是子类型缩小了可能值的范围。`Number` 变量可以从 `Integer` 赋值，但也可以从 `Long` 赋值。同时，`Integer` 变量不能从 `Number` 赋值（因为那个 `Number` 可能是 `Long` 或其他子类型）。同样，`@Nullable String` 可以从 `@NonNull String` 赋值，但 `@NonNull String` 不能从 `@Nullable String` 赋值（因为它可能是 `null`）。

```java
class Example {
  void useNullable(@Nullable String x) {...}
  void useNonNull(@NonNull String x) {...}

  void example(@Nullable String nullable, @NonNull String nonNull) {
    useNullable(nonNull); // JSpecify 允许这样做
    useNonNull(nullable); // JSpecify 不允许这样做
  }
}
```

## 未标注的类型怎么办？

像 `String` 这样既没有被 `@Nullable` 也没有被 `@NonNull` 标注的类型意味着它一直以来的含义：它的值可能被预期包含 `null`，也可能不包含，这取决于你能找到的任何文档（但参见[下文](#nullmarked)获取帮助！）。JSpecify 称之为"unspecified nullness"。

```java
class Unannotated {
  void whoKnows(String x) {...}

  void example(@Nullable String nullable) {
    whoKnows(nullable); // ¯\_(ツ)_/¯
  }
}
```

## `@NullMarked`

如果在 Java 代码中每个类型使用都必须用 `@Nullable` 或 `@NonNull` 标注以避免 unspecified nullness，那会很烦人（尤其是加上[泛型](#generics)后！）。

所以 JSpecify 提供了 [`@NullMarked`] annotation。当你将 `@NullMarked` 应用于模块、包、类或方法时，意味着该作用域内未标注的类型被视为被 `@NonNull` 标注。（下面我们会看到[局部变量](#局部变量)和[类型变量](#声明泛型类型)有一些例外。）在 `@NullMarked` 覆盖的代码中，`String x` 与 `@NonNull String x` 含义相同。

如果应用于模块，其作用域是模块中的所有代码。如果应用于包，其作用域是包中的所有代码。（注意包*不是*层次结构的；将 `@NullMarked` 应用于包 `com.foo` 不会使包 `com.foo.bar` 成为 `@NullMarked`。）如果应用于类、接口或方法，其作用域是该类、接口或方法中的所有代码。

```java
@NullMarked
class Strings {
  static @Nullable String emptyToNull(String x) {
    return x.isEmpty() ? null : x;
  }

  static String nullToEmpty(@Nullable String x) {
    return x == null ? "" : x;
  }
}
```

这是上面的例子，其中包含这些方法的类被 `@NullMarked` 标注。类型的 nullness 与之前相同：`emptyToNull` 不接受 `null` 参数，但可能返回 `null`；`nullToEmpty` 接受 `null` 参数，但不会返回 `null`。但我们能够用更少的 annotation 做到这一点。一般来说，使用 `@NullMarked` 会用更少的 annotation 给你正确的 nullness 语义。在 `@NullMarked` 代码中，你会习惯于将 `String` 这样的普通未标注类型视为对 `String` 对象的真实引用，永远不会是 `null`。

如上所述，[局部变量](#局部变量)和[类型变量](#声明泛型类型)对这种解释有一些例外。

### `@NullUnmarked`

如果你正在将 JSpecify annotation 应用于你的代码，你可能无法一次性全部标注。如果你现在可以将 `@NullMarked` 应用于部分代码，稍后再处理其余部分，这比等到有时间标注所有内容要好。但这意味着你可能需要 null-mark 一个模块、包或类，*除了某些类或方法*。为此，将 [`@NullUnmarked`] 应用于已经在 `@NullMarked` 上下文内的包、类或方法。`@NullUnmarked` 只是撤销周围 `@NullMarked` 的效果，使未标注的类型具有 unspecified nullness，除非它们被 `@Nullable` 或 `@NonNull` 标注，就像根本没有包围的 `@NullMarked` 一样。`@NullUnmarked` 作用域反过来可以包含嵌套的 `@NullMarked` 元素，使该更窄作用域内的大多数未标注类型使用成为 non-null。

## 局部变量

`@Nullable` 和 `@NonNull` 不应用于局部变量——至少不是它们的根类型。（它们应该应用于类型参数和数组组件。）原因是可以根据赋给变量的值来*推断*变量是否可以是 `null`。例如：

```java
@NullMarked
class MyClass {
  void myMethod(@Nullable String one, String two) {
    String anotherOne = one;
    String anotherTwo = two;
    String oneOrTwo = random() ? one : two;
    String twoOrNull = Strings.emptyToNull(two);
    ...
  }
}
```

分析可以判断除 `anotherTwo` 外所有这些变量都可以是 `null`。`anotherTwo` 不能是 `null`，因为 `two` 不能是 `null`：它没有被 `@Nullable` 标注，而且它在 `@NullMarked` 的作用域内。`anotherOne` 可以是 `null`，因为它从 `@Nullable` 参数赋值。`oneOrTwo` 可以是 `null`，因为它可能从 `@Nullable` 参数赋值。`twoOrNull` 可以是 `null`，因为它的值来自返回 `@Nullable String` 的方法。

## 泛型

当你使用泛型类型时，关于 `@Nullable`、`@NonNull` 和 `@NullMarked` 的规则如你所期望的那样。例如，在 `@NullMarked` 上下文中，`List<@Nullable String>` 意味着对 `List` 的引用（不是 `null`），其中每个元素要么是对 `String` 对象的引用，要么是 `null`；但 `List<String>` 意味着一个列表（不是 `null`），其中每个元素是对 `String` 对象的引用，*不能*是 `null`。

### 声明泛型类型 {#声明泛型类型}

当你*声明*泛型类型时，情况会稍微复杂一些。考虑这个：

```java
@NullMarked
public class NumberList<E extends Number> implements List<E> {...}
```

`extends Number` 为类型变量 `E` 定义了一个*边界*。它意味着你可以写 `NumberList<Integer>`，因为 `Integer` 可以赋给 `Number`，但你不能写 `NumberList<String>`，因为 `String` 不能赋给 `Number`。这是标准的 Java 行为。

但现在让我们考虑那个边界与 `@NullMarked` 的关系。我们可以写 `NumberList<@Nullable Integer>` 吗？

在 `@NullMarked` 内，记住，未标注的类型与被 `@NonNull` 标注的类型相同。因为 `E` 的边界与 `@NonNull Number` 相同，而不是 `@Nullable Number`，这意味着 `E` 的类型参数不能是包含 `null` 的类型。那么 `@Nullable Integer` 不能是类型参数，因为它*可以*包含 `null`。（换句话说：`@Nullable Integer` *不是* `Number` 的子类型。）

在 `@NullMarked` 内，如果你希望能够为类型参数替换 nullable 类型参数，你必须在类型变量上显式提供 `@Nullable` 边界：

```java
@NullMarked
public class NumberList<E extends @Nullable Number> implements List<E> {...}
```

现在写 `NumberList<@Nullable Integer>` 是*合法的*，因为 `@Nullable Integer` 可以赋给边界 `@Nullable Number`。写 `NumberList<Integer>` 也是*合法的*，因为普通 `Integer` 可以赋给 `@Nullable Number`。在 `@NullMarked` 内，普通 `Integer` 与 `@NonNull Integer` 含义相同：对实际 `Integer` 值的引用，永远不会是 `null`。这只是意味着由 `E` 表示的值在 `NumberList` 的某些其他参数化上可以是 `null`，但在 `NumberList<Integer>` 的实例中不能。

当然这假设 `List` 本身是以允许 nullable 类型参数的方式编写的：

```java
@NullMarked
public interface List<E extends @Nullable Object> {...}
```

如果是 `interface List<E>` 而不是 `interface List<E extends @Nullable Object>`，那么 `NumberList<E extends @Nullable Number> implements List<E>` 就不合法了。那是因为 `interface List<E>` 是 `interface List<E extends Object>` 的简写。在 `@NullMarked` 内，普通 `Object` 意味着"不能是 `null` 的 `Object` 引用"。`NumberList` 的 `<E extends @Nullable Number>` 与 `<E extends Object>` 不兼容。

所有这些的含义是，每次你定义像 `E` 这样的类型变量时，你需要决定它是否可以被 `@Nullable` 类型替换。如果可以，那么它必须有 `@Nullable` 边界。通常是 `<E extends @Nullable Object>`。另一方面，如果它*不能*表示 `@Nullable` 类型，则通过在其边界中没有 `@Nullable` 来表达（包括根本没有显式边界的情况）。这是另一个例子：

```java
@NullMarked
public class ImmutableList<E> implements List<E> {...}
```

这里，因为它是 `ImmutableList<E>` 而不是 `ImmutableList<E extends @Nullable Object>`，所以写 `ImmutableList<@Nullable String>` 是不合法的。你只能写 `ImmutableList<String>`，这是 non-null `String` 引用的列表。

### 在泛型类型中使用类型变量

让我们看看 `List` 接口中的方法可能是什么样的：

```java
@NullMarked
public interface List<E extends @Nullable Object> {
  boolean add(E element);
  E get(int index);
  @Nullable E getFirst();
  Optional<@NonNull E> maybeFirst();
  ...
}
```

`add` 的参数类型 `E` 意味着与 `List` 元素的实际类型兼容的引用。就像你不能将 `Integer` 添加到 `List<String>` 一样，你也不能将 `@Nullable String` 添加到 `List<String>`，但你*可以*将其添加到 `List<@Nullable String>`。

同样，`get` 的返回类型 `E` 意味着它返回具有列表元素实际类型的引用。如果列表是 `List<@Nullable String>`，那么该引用是 `@Nullable String`。如果列表是 `List<String>`，那么引用是 `String`。

另一方面，（虚构的）`getFirst` 方法的返回类型 `@Nullable E` 总是 `@Nullable`。无论在 `List<@Nullable String>` 还是 `List<String>` 上调用，它都是 `@Nullable String`。其思想是该方法是返回列表的第一个元素，如果列表为空则返回 `null`。同样，`Map` 中的真实方法 `@Nullable V get(Object key)` 和 `Queue` 中的 `@Nullable E peek()` 即使在 `V` 和 `E` 不能是 `null` 时也可以返回 `null`。

这里的区别很重要，值得重复。像 `E` 这样的类型变量的使用只有在意味着*即使* `E` 本身不能是 `null` 也可能是 `null` 的引用时，才应该是 `@Nullable E`。否则，普通 `E` 意味着只有在 `E` 是 `@Nullable` 类型时才能是 `null` 的引用，比如这个例子中的 `@Nullable String`。（而且，正如我们所见，只有当 `E` 的定义具有 `@Nullable` 边界如 `<E extends @Nullable Object>` 时，`E` 才能是 `@Nullable` 类型。）

同样，你可以使用 `@NonNull E` 来指示*即使 `E` 是 nullable* 也是 non-nullable 的类型。虚构的 `maybeFirst()` 方法返回 non-nullable 的 `Optional`。`Optional` 对象只能容纳 non-null 值，所以将其定义为 `class Optional<T>` 是合理的；也就是说，它的类型参数不能是 nullable。所以即使对于 `List<@Nullable String>`，`maybeFirst()` 也必须返回 `Optional<@NonNull String>`。声明这一点的方法是将 `maybeFirst()` 的返回类型声明为 `Optional<@NonNull E>`。

我们之前看到 `@NullMarked` 通常意味着"引用不能是 `null`，除非它们被标记为 `@Nullable`"，而且这不适用于局部变量。这里我们看到它也不适用于未标注的类型变量使用，因为边界是 `@Nullable` 的未标注类型变量使用可能被替换为 `@Nullable` 类型参数。

### 在泛型方法中使用类型变量

我们刚才看到的泛型类型的相同考虑本质上也适用于泛型方法。这里有一个例子：

```java
@NullMarked
public class Methods {
  public static <T> @Nullable T
      firstOrNull(List<T> list) {
    return list.isEmpty() ? null : list.get(0);
  }

  public static <T> T
      firstOrNonNullDefault(List<T> list, T defaultValue) {
    return list.isEmpty() ? defaultValue : list.get(0);
  }

  public static <T extends @Nullable Object> T
      firstOrDefault(List<T> list, T defaultValue) {
    return list.isEmpty() ? defaultValue : list.get(0);
  }

  public static <T extends @Nullable Object> @Nullable T
      firstOrNullableDefault(List<T> list, @Nullable T defaultValue) {
    return list.isEmpty() ? defaultValue : list.get(0);
  }
}
```

`firstOrNull` 方法将接受 `List<String>` 但不接受 `List<@Nullable String>`。当给定 `List<String>` 类型的参数时，`T` 是 `String`，所以返回类型 `@Nullable T` 是 `@Nullable String`。输入列表不能包含 `null` 元素，但返回值可以是 `null`。

`firstOrNonNullDefault` 方法同样不允许 `T` 是 `@Nullable` 类型，所以 `List<@Nullable String>` 是不允许的。现在返回值也不是 `@Nullable`，这意味着它永远不会是 `null`。

`firstOrDefault` 方法将接受 `List<String>` 和 `List<@Nullable String>` 两者。在第一种情况下，`T` 是 `String`，所以 `defaultValue` 参数的类型和返回值的类型都是 `String`，意味着两者都不能是 `null`。在第二种情况下，`T` 是 `@Nullable String`，所以 `defaultValue` 的类型和返回值的类型都是 `@Nullable String`，意味着两者都可以是 `null`。

`firstOrNullableDefault` 方法同样接受 `List<String>` 和 `List<@Nullable String>` 两者，但现在 `defaultValue` 参数被标记为 `@Nullable`，所以即使在 `List<String>` 情况下它也可以是 `null`。同样返回值是 `@Nullable T`，所以即使 `T` 不能是 `null`，它也可以是 `null`。

这是另一个例子：

```java
@NullMarked
public static <T> List<@Nullable T> nullOutMatches(List<T> list, T toRemove) {
  List<@Nullable T> copy = new ArrayList<>(list);
  for (int i = 0; i < copy.size(); i++) {
    if (copy.get(i).equals(toRemove)) {
      copy.set(i, null);
    }
  }
  return copy;
}
```

这接受 `List<T>`，根据定义它不包含 `null` 元素，并产生 `List<@Nullable T>`，其中每个匹配 `toRemove` 的元素都被替换为 `null`。输出是 `List<@Nullable T>`，因为它*可以*包含 `null` 元素，即使 `T` 本身不能是 `null`。

## 一些更微妙的细节

前面的章节涵盖了有效使用 JSpecify annotation 所需了解的 99% 的内容。这里我们将介绍一些你可能不需要知道的细节。

### 类型使用 annotation 语法

有几个地方，像 `@Nullable` 和 `@NonNull` 这样的类型使用 annotation 的语法可能令人惊讶。

1.  对于像 `Map.Entry` 这样的嵌套静态类型，如果你想说值可以是 `null`，语法是 `Map.@Nullable Entry`。你通常可以通过直接导入嵌套类型来避免处理这个问题，但在这种情况下，`import java.util.Map.Entry` 可能是不可取的，因为 `Entry` 是这样一个常见的类型名称。

1.  对于数组类型，如果你想说数组的*元素*可以是 `null`，语法是 `@Nullable String[]`。如果你想说*数组本身*可以是 `null`，语法是 `String @Nullable []`。如果元素和数组本身都可以是 `null`，语法是 `@Nullable String @Nullable []`。

记住这一点的好方法是 `@Nullable` 后面的东西可以是 `null`。在 `Map.@Nullable Entry` 中，可以是 `null` 的是 `Entry`，而不是 `Map`。在 `@Nullable String[]` 中，可以是 `null` 的是 `String`，而在 `String @Nullable []` 中，可以是 `null` 的是 `[]`，也就是数组。

### 通配符边界

在 `@NullMarked` 内，通配符边界的工作方式与类型变量边界几乎完全相同。我们看到 `<E extends @Nullable Number>` 意味着 E 可以是 `@Nullable` 类型，而 `<E extends Number>` 意味着它不能是。同样，`List<? extends @Nullable Number>` 意味着元素可以是 `null` 的列表，而 `List<? extends Number>` 意味着它们不能是。

然而，当没有显式边界时，有一个区别。我们看到像 `<E>` 这样的类型变量定义意味着 `<E extends Object>`，这意味着它不是 `@Nullable`。但 `<?>` 实际上意味着 `<? extends B>`，其中 `B` 是相应类型变量的边界。所以如果我们有

```java
interface List<E extends @Nullable Object> {...}
```

那么 `List<?>` 与 `List<? extends @Nullable Object>` 含义相同。如果我们有

```java
class ImmutableList<E> implements List<E> {...}
```

那么我们看到这意味着与以下相同

```java
class ImmutableList<E extends Object> implements List<E>
```

所以 `ImmutableList<?>` 与 `ImmutableList<? extends Object>` 含义相同。在这里，`@NullMarked` 意味着 `Object` 排除 `null`。`List<?>` 的 `get(int)` 方法可以返回 `null`，但 `ImmutableList<?>` 的相同方法不能。

[`@NonNull`]: https://jspecify.dev/docs/api/org/jspecify/annotations/NonNull.html
[`@Nullable`]: https://jspecify.dev/docs/api/org/jspecify/annotations/Nullable.html
[`@NullMarked`]: https://jspecify.dev/docs/api/org/jspecify/annotations/NullMarked.html
[`@NullUnmarked`]: https://jspecify.dev/docs/api/org/jspecify/annotations/NullUnmarked.html