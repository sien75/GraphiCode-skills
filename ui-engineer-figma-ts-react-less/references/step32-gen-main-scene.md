# Generate React Component Example Based on README and static mockup

Follow the steps below to gradually generate and improve the React Component.

## Generate Main Scene Static React Component Based on Main static mockup

Generally, main static mockups include normal page and drawer container scenarios, all of which can be considered as main static mockups.

Assuming the design context README (`<designContextDirs>/<stateId>/README.md`) content is:

```md
page1: 1-1
page2: 1-2
> page2 xxx: 1-3
drawer1: 1-4
```

Then you can copy `Page1.tsx`, `Page1.less`, `Page2.tsx`, `Page2.less`, `Drawer1.tsx`, `Drawer1.less` from `<designContextDirs>/<stateId>/` to `<stateDirs.pages>/<stateId>/` based on the previously temporarily stored files using the `cp` command.

Generally, you just need to copy the temporarily stored files using the `cp` command without reading files to consume context.

After copying, add a comment block at the top of each scene tsx file to record which Figma node IDs it corresponds to. Initially this contains only the main scene's node ID; secondary scene node IDs will be appended later when they are handled.

```tsx
/*
 * corresponded figma node-ids
 * page1: 1-1
 */
```

Then update `<stateDirs.pages>/<stateId>/index.tsx` to import these scene components and assemble them in the page component:

```tsx
// Add imports at the top
import Page1 from './Page1';
import Page2 from './Page2';
import Drawer1 from './Drawer1';

// In the page component
const LoginPage: React.FC<{
  data: any;
  stateInstance: LoginPageState;
}> = (props) => {
  const { data, stateInstance } = props;

  return (
    <div>
      <Page1 data={data} stateInstance={stateInstance} />
      <Page2 data={data} stateInstance={stateInstance} />
      <Drawer1 data={data} stateInstance={stateInstance} />
    </div>
  );
};
```

## Apply Main Scene Data from README to Static React Component

The React Component generated from main static mockup is still static. Now you need to assign real props parameters to designated positions in TSX.

In `<stateDirs.pages>/<stateId>/index.tsx`, the page component passes both `data` and `stateInstance` to each scene:

**IMPORTANT: You MUST pass the complete `data` object and `stateInstance` to every scene component. Do NOT selectively pass a subset of data fields (e.g., `{ status, email }`) to different scenes. Each scene component receives the full `data` and `stateInstance`, and internally decides which fields to use.** The principle "NOT all data and event list need to be used" applies INSIDE scene components, NOT at the index.tsx level.

Then start a subagent for each scene, and inject into the subagent context:

1. tsx and less file paths for that scene (in `<stateDirs.pages>/<stateId>/`)
2. state and event parts from README
3. Related type details

### for subagent context

```md
Read the static React component and associate it with props data and events.

React path: {xxx} (supplied by main agent).
less path: {xxx} (supplied by main agent).

**Standard module format rules:**
- Use standard import/export. The component uses `export default` at the end.
- Use Less Modules: `import styles from './xxx.less'` and `className={styles.xxx}`
- React is imported at the top: `import React, { useState, useEffect } from 'react'`
- Props format is `{ data, stateInstance }`.
- Assets (images, icons, etc.) are referenced via import or relative path.

props follows the { data, stateInstance } format.

where data type is: {xxx} (supplied by main agent, i.e., state part from README).

Events are published via `stateInstance._publish(eventId, payload)`. The available event IDs and their payload types are: {xxx} (supplied by main agent, i.e., event part from README).

Related types are: {xxx} (supplied by main agent).

**Important: NOT all data and event list need to be used. You need to judge which data and event list are useful in the current scenario and use only a part. For example, if this is the forget password scenario, then the "forget password verification code countdown" state is useful, the "forget password set new password button click" event is useful, while the "login verification code countdown" state is not useful, and the "first-time login set new password click" event is not useful.**

In the specific scene code (e.g., Page1.tsx), assign real props parameters to designated positions in TSX, for example:

Original TSX:

// other code
<div className={styles.name}>Jammy</div>
<button>edit</button>
// other code

Replaced TSX:

// other code
const { data, stateInstance } = props
const { name, canEdit } = data
const onEdit = () => {
   stateInstance._publish('Page1.editClick', {})
}
// other code
<div className={styles.name}>{name}</div>
<button onClick={onEdit} disabled={!canEdit}>edit</button>
// other code

The less file uses Less Modules (`styles.xxx`). Ensure all CSS classes in tsx use `styles.xxx` and have corresponding definitions in the less file.

Write the changes back to tsx and less files.
```

## Handle non-toast secondary static mockup

This type of secondary static mockup contains different scenarios adjacent to the previous main static mockup, such as:

* Main static mockup depicts content under Tab1, then secondary static mockup depicts content under Tab2
* Main static mockup depicts content in static state, then secondary static mockup depicts content in loading state
* Main static mockup depicts content in inactive state, then secondary static mockup depicts content in active state

Therefore, first find the main static mockup associated with this secondary static mockup. For example, given this design context README:

```md
page1: 1-1
> page1 loading: 1-2
page2: 1-3
```

The main static mockup associated with page1 loading secondary static mockup is the nearest main static mockup above it: page1.

After finding it, similarly start a subagent and inject:

1. tsx and less file paths for main scene (in `<stateDirs.pages>/<stateId>/`)
2. tsx and less file paths for secondary scene (in `./.tmp/`)
3. state and event parts from README
4. Related type details
5. Explanation of what is secondary scene

into the subagent context for reference.

### for subagent context

```md
Read the static React component and add secondary scene to the main scene.

Main scene
React path: {xxx} (supplied by main agent).
less path: {xxx} (supplied by main agent).

Secondary scene
React path: {xxx} (supplied by main agent).
less path: {xxx} (supplied by main agent).

**Standard module format rules:**
- Use standard import/export. The component uses `export default` at the end.
- Use Less Modules: `import styles from './xxx.less'` and `className={styles.xxx}`
- React is imported at the top: `import React, { useState, useEffect } from 'react'`
- Props format is `{ data, stateInstance }`.
- Assets (images, icons, etc.) are referenced via import or relative path.

props follows the { data, stateInstance } format.

where data type is: {xxx} (supplied by main agent, i.e., state part from README).

Events are published via `stateInstance._publish(eventId, payload)`. The available event IDs and their payload types are: {xxx} (supplied by main agent, i.e., event part from README).

Related types are: {xxx} (supplied by main agent).

**Important: NOT all data and event list need to be used. You need to judge which data and event list are useful in the current scenario and use only a part. For example, if this is the forget password scenario, then the "forget password verification code countdown" state is useful, the "forget password set new password button click" event is useful, while the "login verification code countdown" state is not useful, and the "first-time login set new password click" event is not useful.**

**What is secondary scene?**

Name: {xxx} (supplied by main agent, the scene name from the design context README).
Description: {xxx} (supplied by main agent, the description text from the design context README only, no interpretation).

**IMPORTANT: You MUST discover the differences yourself by reading and comparing files. Do NOT rely on the name/description above to assume what the differences are. Follow the comparison procedure below.**

**Comparison Procedure (MUST follow in order):**
1. Read the secondary scene's tsx file AND less file in full
2. Read the main scene's current tsx file AND less file in full
3. Compare both tsx files to identify structural differences (e.g., added/removed elements, changed attributes, conditional rendering)
4. Compare both less files to identify style differences (e.g., loading styles, disabled/greyed-out styles, active/hover states, visibility changes)
5. Based on ALL differences found (structural + style), determine what modifications are needed in the main scene

In the specific scene code (e.g., Page1.tsx), implement the secondary scene code, for example, the reviewing uneditable scene here:

Main scene TSX:

// other code
const { data, stateInstance } = props
const { name } = data
const onEdit = () => {
   stateInstance._publish('Page1.editClick', {})
}
// other code
<div className={styles.name}>{name}</div>
<button onClick={onEdit}>edit</button>
// other code

Secondary scene TSX, representing reviewing scenario:

// other code
<div className={styles.name}>Jammy</div>
<button disabled>edit</button>
// other code

Understand that reviewing means graying out the button, then modify the main scene TSX:

// other code
const { data, stateInstance } = props
const { name, reviewing } = data
const onEdit = () => {
   stateInstance._publish('Page1.editClick', {})
}
// other code
<div className={styles.name}>{name}</div>
<button onClick={onEdit} disabled={reviewing}>edit</button>
// other code

The less file uses Less Modules (`styles.xxx`). Ensure all CSS classes in tsx use `styles.xxx` and have corresponding definitions in the less file.

Also append the secondary scene's node ID to the comment block at the top of the main scene tsx file:

For example:

/*
 * corresponded figma node-ids
 * page1: 1-1
 * page1 loading: 1-2
 */

Write the changes back to main scene tsx and less files.
```

## Handle toast secondary static mockup

Toast secondary static mockups show toast/notification messages that appear in response to certain actions or states. Unlike non-toast secondary, you don't need to diff two mockups — you just need to know the toast content and when it triggers.

Similarly start a subagent and inject:

1. tsx and less file paths for the associated main scene (in `<stateDirs.pages>/<stateId>/`)
2. tsx and less file paths for the toast secondary scene (in `./.tmp/`)
3. state and event parts from README
4. Related type details
5. Toast scene name from the design context README

### for subagent context

```md
Read the main scene React component and add toast trigger logic.

Main scene
React path: {xxx} (supplied by main agent).
less path: {xxx} (supplied by main agent).

Toast secondary scene
React path: {xxx} (supplied by main agent).
less path: {xxx} (supplied by main agent).

**Standard module format rules:**
- Use standard import/export. The component uses `export default` at the end.
- Use Less Modules: `import styles from './xxx.less'` and `className={styles.xxx}`
- React is imported at the top: `import React, { useState, useEffect } from 'react'`
- Props format is `{ data, stateInstance }`.
- Assets (images, icons, etc.) are referenced via import or relative path.

props follows the { data, stateInstance } format.

where data type is: {xxx} (supplied by main agent, i.e., state part from README).

Events are published via `stateInstance._publish(eventId, payload)`. The available event IDs and their payload types are: {xxx} (supplied by main agent, i.e., event part from README).

Related types are: {xxx} (supplied by main agent).

**Toast info**

Name: {xxx} (supplied by main agent, the toast scene name from the design context README).
Description: {xxx} (supplied by main agent, the description text from the design context README only, no interpretation).

Read the toast secondary scene's tsx file to identify the toast content, then determine under what circumstances this toast is triggered based on data and events from README. Add the toast trigger logic into the main scene tsx and less files.

Write the changes back to main scene tsx and less files.
```
