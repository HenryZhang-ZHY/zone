---
title: 'Separation of Concerns'
description: ''
pubDate: 2025-05-31
updatedDate: 2025-07-10
---

**关注点分离**（Separation of Concerns，简称 **SoC**）是一种思考方式，主张不要同时处理问题的多个方面，而是集中精力深入研究某一特定方面，有意识地将其他方面暂时搁置。[^1]

在程序设计领域，关注点分离是一种被广泛应用的设计原则。从不同的关注点出发，将系统划分为多个相对独立的模块，可以显著降低系统的复杂性，同时提高系统的可维护性和可扩展性。[^2]

## 关注点分离的实践

### 网页内容和样式的关注点分离

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

### 命令执行和结果输出的关注点分离

这是一个真实的 Rust CLI 应用的例子，程序需要处理不同的子命令（如 `new`、`list`、`remove`），每个子命令都支持 `json` 和 `text` 两种输出格式。
在最初的实现中，子命令的执行逻辑和结果输出逻辑混合在一起，导致代码难以阅读和维护。

```rust
fn main() {
    let sub_command = parse_args();
    let format = parse_format_option();
    match sub_command {
        SubCommand::New => {
            if let Ok(data) = execute_new_command() {
                match format {
                    "json" => println!(r#"{{"status": "success", "data": "{}"}}"#, data),
                    _ => println!("Success: {}", data),
                }
            } else {
                match format {
                    "json" => eprintln!(r#"{{"status": "error", "message": "{}"}}"#, "Failed to execute new command"),
                    _ => eprintln!("Error: Failed to execute new command"),
                }
            }
        }
        SubCommand::List => {
            if let Ok(data) = execute_list_command() {
                match format {
                    "json" => println!(r#"{{"status": "success", "data": {}}}"#, data),
                    _ => println!("List: {}", data),
                }
            } else {
                match format {
                    "json" => eprintln!(r#"{{"status": "error", "message": "{}"}}"#, "Failed to execute list command"),
                    _ => eprintln!("Error: Failed to execute list command"),
                }
            }
        }
        SubCommand::Remove => {
            if let Ok(data) = execute_remove_command() {
                match format {
                    "json" => println!(r#"{{"status": "success", "data": "{}"}}"#, data),
                    _ => println!("Success: {}", data),
                }
            } else {
                match format {
                    "json" => eprintln!(r#"{{"status": "error", "message": "{}"}}"#, "Failed to execute remove command"),
                    _ => eprintln!("Error: Failed to execute remove command"),
                }
            }
        }
    }
}
```

我们通过以下重构来实现关注点分离：
1. 创建 `ExecutionResult` 枚举来表示命令执行的结果。
2. 将子命令的执行逻辑提取到 `execute_command` 函数中，返回 `ExecutionResult`。
3. 将结果输出逻辑分别提取到 `print_json` 和 `print_text` 函数中，各自根据 `ExecutionResult` 的类型进行不同的处理。
4. 在 `main` 函数中调用 `execute_command` 执行子命令，并根据用户选择的格式调用相应的输出函数。

```rust
fn main() {
    let sub_command = parse_args();
    let format = parse_format_option();

    let execution_result = execute_command(sub_command);
    
    match format {
        "json" => print_json(execution_result),
        _ => print_text(execution_result),
    }
}

fn execute_command(sub_command: SubCommand) -> ExecutionResult {
    match sub_command {
        SubCommand::New => execute_new_command(),
        SubCommand::List => execute_list_command(),
        SubCommand::Remove => execute_remove_command(),
    }
}

enum ExecutionResult {
    Success(String),
    List(Vec<String>),
    Error(String),
}

fn print_json(result: ExecutionResult) {
    match result {
        ExecutionResult::Success(data) => {
            println!(r#"{{"status": "success", "data": {}}}"#, data);
        }
        ExecutionResult::List(data) => {
            println!(r#"{{"status": "success", "data": {}}}"#, data);
        }
        ExecutionResult::Error(err) => {
            eprintln!(r#"{{"status": "error", "message": "{}"}}"#, err);
        }
    }
}

fn print_text(result: ExecutionResult) {
    match result {
        ExecutionResult::Success(data) => {
            println!("Success: {}", data);
        }
        ExecutionResult::List(data) => {
            println!("List: {}", data);
        }
        ExecutionResult::Error(err) => {
            eprintln!("Error: {}", err);
        }
    }
}
```

经过重构，命令执行和结果格式化输出这两个关注点被明确分离开来，代码可读性显著提升，更易于维护和扩展。

### 业务逻辑和控制逻辑的关注点分离

陈皓经常在他的文章中提到的“业务逻辑和控制逻辑分离”其实就是一种关注点分离的实践。[^3] [^4] [^5]

## 编程时如何实现关注点分离

我时常会遇到这样的困境：面对一段杂乱无章的代码，虽然能够识别出不同的关注点，却绞尽脑汁也想不出合适的分离方式。

如果换个角度分析，从“如何把这些关注点分离开”转为思考“假设这些关注点已经分离，我该如何把分离的部分连接起来”，就更容易想出解决方案。因为编程时大部分工作就是把不同的组件组合起来，我们已经充分练习过“连接分离的部分”这件事，做起来更加得心应手。

这其实是对“倒推法”的应用，从预期的结果出发，假设各个关注点已经被分离开，把“分离”的任务变成我们更加熟悉的“组合”任务，问题的难度就会大大降低。

## 参考资料

[^1]: [E.W. Dijkstra Archive: On the role of scientific thought (EWD447)](https://www.cs.utexas.edu/~EWD/transcriptions/EWD04xx/EWD447.html)

[^2]: [Separation of Concerns - Wikipedia](https://en.wikipedia.org/wiki/Separation_of_concerns)

[^3]: [我做系统架构的一些原则 | 酷 壳 - CoolShell](https://coolshell.cn/articles/21672.html#%E5%8E%9F%E5%88%99%E4%B8%83%EF%BC%9A%E5%AF%B9%E6%8E%A7%E5%88%B6%E9%80%BB%E8%BE%91%E8%BF%9B%E8%A1%8C%E5%85%A8%E9%9D%A2%E6%94%B6%E5%8F%A3)

[^4]: [HTTP的前世今生 | 酷 壳 - CoolShell](https://coolshell.cn/articles/19840.html#HTTP_09_10)

[^5]: [Go编程模式：Map-Reduce | 酷 壳 - CoolShell](https://coolshell.cn/articles/21164.html#%E4%B8%9A%E5%8A%A1%E7%A4%BA%E4%BE%8B)
