---
title: 'Does a Modern .NET Project Still Need ComVisible(false)?'
description: 'What the assembly-level ComVisible attribute controls, why older C# projects contain it, and when it still matters in .NET 10 and later.'
pubDate: 2026-09-10
threeLevelNote: |
  - L1 ComVisible controls the managed surface exposed to COM
    - L2 The assembly-level attribute sets the default for public types
      - L3 false hides public types unless a type explicitly opts in
      - L3 it does not prevent managed code from consuming COM components
    - L2 AssemblyInfo.cs was the traditional home for assembly metadata
      - L3 older Visual Studio templates generated it and defaulted COM visibility to false
  - L1 Most modern .NET applications do not need the attribute
    - L2 a normal web, console, or service project does not publish a COM server
      - L3 .NET 5+ COM activation also requires an enabled COM host and explicit class identifiers
    - L2 SDK-style projects generate common assembly metadata during the build
      - L3 AssemblyInfo.cs is no longer intrinsically required
  - L1 Keep an explicit boundary when COM exposure is intentional or plausible
    - L2 COM servers should use default-deny visibility
      - L3 mark the assembly false and opt selected interfaces and classes in with true
    - L2 migrated or multi-targeted libraries may retain the attribute
      - L3 it is harmless documentation when .NET Framework consumers or COM tooling remain in scope
---

Many C# projects contain a file named `AssemblyInfo.cs` with this line:

```csharp
[assembly: ComVisible(false)]
```

It is easy to treat it as boilerplate from an older version of Visual Studio. That is partly correct, but the attribute itself is not obsolete. The useful question is not whether `.NET 10` still recognizes it. It does. The useful question is whether the assembly has a COM boundary to control.

## What `ComVisible` controls

COM is the Windows component model used by technologies such as Office automation, ActiveX, and many older native applications. A .NET object can be presented to a COM client through a **COM Callable Wrapper**.

`ComVisibleAttribute` controls which managed types and members are eligible to cross that boundary. According to the [.NET API documentation](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.comvisibleattribute?view=net-10.0), COM visibility defaults to `true` for public managed types. Applying the attribute at assembly level changes the default for every public type in that assembly:

```csharp
using System.Runtime.InteropServices;

[assembly: ComVisible(false)]
```

An individual public type can then opt back in:

```csharp
[ComVisible(true)]
[Guid("21D5A08E-0B26-4A5A-8E6F-31A5E69382F9")]
public sealed class ReportGenerator
{
}
```

This is a default-deny policy: do not expose the assembly accidentally; expose only the contract designed for COM.

There are two important limits to that statement. First, `ComVisible(true)` cannot make an `internal` type public. Second, `[assembly: ComVisible(false)]` does **not** stop the project from consuming COM APIs. It controls managed code being exposed *to* COM, not managed code calling *into* COM.

## Why it appears in `AssemblyInfo.cs`

Before SDK-style projects, Visual Studio created `Properties/AssemblyInfo.cs` as the central place for assembly metadata: title, version, company, GUID, and COM visibility. Project templates commonly chose `[assembly: ComVisible(false)]` because most assemblies were not intended to become COM components. A restrictive default also prevented a newly added public class from silently expanding the COM-visible surface.

Modern SDK-style projects changed where this metadata comes from. The .NET SDK generates common assembly attributes from the project file during the build. Microsoft therefore recommends either migrating old settings into the project file or disabling generated assembly information when porting an old project. `AssemblyInfo.cs` has no special runtime role; it is simply a C# file containing assembly-level attributes.

This explains why the line survives in many repositories. It may represent an intentional interop boundary, but it may also be unchanged template output from a project created years ago.

## Does .NET 10 need it?

For an ordinary ASP.NET Core application, worker service, console tool, test project, or cross-platform library, the practical answer is **no**. If the project does not expose managed classes as COM components, adding `[assembly: ComVisible(false)]` changes nothing useful.

Modern .NET also makes COM exposure more deliberate than the attribute alone suggests. To expose a .NET component through the built-in COM host, a project must enable `EnableComHosting`, provide stable GUIDs, mark the intended types as COM-visible, build a COM host, and register that host or use registration-free COM. Merely omitting `[assembly: ComVisible(false)]` does not publish every public class as an immediately activatable COM server. The [official COM hosting guide](https://learn.microsoft.com/en-us/dotnet/core/native-interop/expose-components-to-com) documents these additional steps.

The decision can therefore be made from the project's actual boundary:

| Project situation | Recommendation |
| --- | --- |
| No COM interop | Do not add the attribute; removing inherited boilerplate is reasonable |
| Only consumes COM, such as Office automation | The attribute is not required |
| Exposes .NET objects to COM | Keep assembly-level `false` and opt in designed types with `true` |
| Targets .NET Framework or is being migrated from it | Keep it until COM consumers and registration behavior have been checked |
| Shared library where accidental COM exposure is a realistic compatibility risk | Keeping it is a reasonable explicit policy |

## Treat it as a boundary decision

The presence of `[assembly: ComVisible(false)]` is not evidence that a project uses COM. The absence of it is not, by itself, evidence that public classes are being published to COM. To decide whether it belongs, ask four concrete questions:

1. Does any unmanaged client instantiate types from this assembly?
2. Does the project enable COM hosting or use .NET Framework COM registration tooling?
3. Are any interfaces or classes marked with `[ComVisible(true)]`, `[Guid]`, or `[ComImport]`?
4. Does the assembly still support consumers whose COM behavior is unknown?

If every answer is no, the line is historical noise in a modern .NET 10 project. If the assembly is a COM server, the line still expresses a sound design: keep the assembly closed by default and expose a small, explicit, versioned contract.

That distinction matters more than the runtime version. `ComVisible(false)` is neither mandatory modern hardening nor dead legacy syntax. It is a policy for a specific interoperability boundary. Keep it when that boundary exists; otherwise, do not add it out of habit.

## References

- [ComVisibleAttribute class](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.comvisibleattribute?view=net-10.0)
- [Exposing .NET components to COM](https://learn.microsoft.com/en-us/dotnet/core/native-interop/expose-components-to-com)
- [Set assembly attributes in project files](https://learn.microsoft.com/en-us/dotnet/standard/assembly/set-attributes-project-file)
