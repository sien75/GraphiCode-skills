# Remove Framework Code Example

Check the tsx and less files in the `<designContextDirs>/<stateId>` directory. For each pair of tsx & less files with the same name, start a subagent to do the following.

**IMPORTANT: You MUST use a subagent for each tsx & less pair. Do NOT read mockup file contents in the main context.** Reason: mockup files are typically very large; reading them in the main context wastes tokens and pollutes the context window, degrading the quality of subsequent steps. Delegate all file reading and modification to the subagent.

## for subagent context

```md
Assuming the page structure is like this:

<div className={styles.personalCenter}>
  <div className={styles.pageFrame}>
    {/* Content Area Background */}
    {/* Sidebar */}
    {/* Navigation */}
    {/* Expand Button */}
  </div>

  {/* Breadcrumb */}

  {/* Main Content Card */}
  <div className={styles.mainContentCard}>
    {/* Header Card */}
    {/* Details Section */}
  </div>
</div>

You should delete all the tsx and associated less for the pageFrame framework part, including Content Area Background / Sidebar / Navigation / Expand Button.

**Keep standard module format:**
The output files must retain standard TypeScript module format:
- Keep all `import` statements (e.g., `import React from 'react'`, `import styles from './xxx.less'`)
- Keep `export default` at the end of the file
- Keep Less Modules usage: `className={styles.xxx}`
- Keep the component as a standard React.FC with typed props

Save all modified static mockup results by their original names to `./.tmp`.
```
