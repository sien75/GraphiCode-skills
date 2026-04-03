# Remove Framework Code Example

Check the tsx and less files in the `<designContextDirs>/<stateId>` directory. For each pair of tsx & less files with the same name, start a subagent to do the following.

## for subagent context

```md
Assuming the page structure is like this:

<div className="personalCenter">
  <div className="pageFrame">
    {/* Content Area Background */}
    {/* Sidebar */}
    {/* Navigation */}
    {/* Expand Button */}
  </div>

  {/* Breadcrumb */}

  {/* Main Content Card */}
  <div className="mainContentCard">
    {/* Header Card */}
    {/* Details Section */}
  </div>
</div>

You should delete all the tsx and associated less for the pageFrame framework part, including Content Area Background / Sidebar / Navigation / Expand Button.

Save all modified static mockup results by their original names to `./tmp`.
```