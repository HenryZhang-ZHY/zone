---
title: Content Negotiation Between Browser and ASP.NET Core
description: ''
pubDate: 2026-1-7
---

## Problem Statement

The ASP.NET Core Server sends a response in `text/plain` format even when the browser requests putting `application/json` at a higher priority in the `Accept` header.

The `Accept` header sent by the browser is `Accept: application/json, text/plain, */*`.

The action method is defined as follows:

```csharp
[HttpGet("data")]
public IActionResult GetData()
{
    var data = "Hello, World!";
    return Ok(data);
}
```

## Analysis

This is the default behavior description of ASP.NET Core when it detects that the request is coming from a web browser. [^1]

> Unlike typical API clients, web browsers supply Accept headers. Web browsers specify many formats, including wildcards. 
>
> By default, when the framework detects that the request is coming from a browser:
>
> - The Accept header is ignored.
> - The content is returned in JSON, unless otherwise configured.
>
> This approach provides a more consistent experience across browsers when consuming APIs.

According to the above description, the response content should be in JSON format. However, in practice, the response is in `text/plain` format.

Why does this happen?

Because the second bullet point is not entirely accurate. The actual framework behavior is to select the first registered output formatter that can handle the response type.

In this case, the response type is `string`, and the first registered output formatter that can handle `string` is the `StringOutputFormatter`, which produces `text/plain` responses. [^2]

## Solution

Since the issue is due to the accept header being ignored for browser requests, we can configure the framework to respect the `Accept` header even for browser requests by setting the `RespectBrowserAcceptHeader` option to `true`.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.RespectBrowserAcceptHeader = true;
});
```

[^1]: [Browsers and content negotiation | Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/web-api/advanced/formatting?view=aspnetcore-10.0#browsers-and-content-negotiation-2)

[^2]: [OutputFormatter registration in MvcCoreMvcOptionsSetup.cs](https://github.com/dotnet/aspnetcore/blob/6f8ecc7c9c0afb5fc55b1fee97faac9ab5e80e5c/src/Mvc/Mvc.Core/src/Infrastructure/MvcCoreMvcOptionsSetup.cs#L76-L82)
