# Generate React Component Example Based on README and static mockup

Follow the steps below to gradually generate and improve the React Component.

## Generate Main Scene Static React Component Based on Main static mockup

Generally, main static mockups include normal page and drawer container scenarios, all of which can be considered as main static mockups.

Assuming node-ids content is:

```md
page1: 1-1
page2: 1-2
> page2 xxx: 1-3
drawer1: 1-4
```

Then you can copy `Page1.tsx`, `Page1.less`, `Page2.tsx`, `Page2.less`, `Drawer1.tsx`, `Drawer2.less` from `<designContextDirs>/<stateId>/` to `<stateDirs.pages>/<stateId>/` based on the previously temporarily stored files using the `cp` command.

Generally, you just need to copy the temporarily stored files using the `cp` command without reading files to consume context.

Then in `<stateDirs.pages>/<stateId>/<mainFileName>`, import these pages:

```tsx
// other code
import Page1 from './Page1.tsx';
import Page2 from './Page2.tsx';
import Page3 from './Page3.tsx';

export class xxx; // don't modify

const Page = () => {
   // other code
   return (
      <div>
         <Page1 />
         <Page2 />
         <Page3 />
     </div>
   );
}

// other code
```

## Apply Main Scene Data from README to Static React Component

The React Component generated from main static mockup is still static. Now you need to assign real props parameters to designated positions in TSX.

First, you need to assign props in `<stateDirs.pages>/<stateId>/<mainFileName>` to each scene:

```tsx
// other code
const Page: React.FC<{  any, stateInstance: Xxx }> = (props) => {
   const {  data, stateInstance } = props;
  return (
    <div>
       <Page1  data={data} stateInstance={stateInstance} />
       <Page2  data={data} stateInstance={stateInstance} />
       <Page3  data={data} stateInstance={stateInstance} />
    </div>
  );
}
// other code
```

Then start a subagent for each scene, and inject into the subagent context:

1. tsx and less file paths for that scene (in `<stateDirs.pages>/<stateId>/`)
2. state and event parts from README
3. Related type details

### for subagent context

```md
Read the static React component and associate it with props data and events.

React path: {xxx} (supplied by main agent).
less path: {xxx} (supplied by main agent).

props follows the {  data, stateInstance } format.

where data type is: {xxx} (supplied by main agent, i.e., state part from README).

`stateInstance._publish(eventId, payload)` can trigger events, where eventId and corresponding event type are: {xxx} (supplied by main agent, i.e., event part from README).

Related types are: {xxx} (supplied by main agent, read from `<typeDirs>/<typeId>/index.ts`).

**Important: NOT all data and event list need to be used. You need to judge which data and event list are useful in the current scenario and use only a part. For example, if this is the forget password scenario, then the "forget password verification code countdown" state is useful, the "forget password set new password button click" event is useful, while the "login verification code countdown" state is not useful, and the "first-time login set new password click" event is not useful.**

In the specific scene code (e.g., Page1.tsx), assign real props parameters to designated positions in TSX, for example:

Original TSX:

// other code
<div className="name">Jammy</div>
<button>edit</button>
// other code

Replaced TSX:

// other code
const {   { name, canEdit }, stateInstance } = props;
const onEdit = () => {
   stateInstance._publish('Page1.editClick', {}); // When publishing, specify the trigger, i.e., Page1.editClick, not just editClick
}
// other code
<div className="name">{name}</div>
<button onClick={onEdit} disabled={!canEdit}>edit</button>
// other code

The less file changes are similar, ensure all CSS classes in tsx have corresponding definitions in the less file.

Write the changes back to tsx and less files.
```

## Handle non-storyboard / toast secondary static mockup

This type of secondary static mockup contains different scenarios adjacent to the previous main static mockup, such as:

* Main static mockup depicts content under Tab1, then secondary static mockup depicts content under Tab2
* Main static mockup depicts content in static state, then secondary static mockup depicts content in loading state
* Main static mockup depicts content in inactive state, then secondary static mockup depicts content in active state

Therefore, first find the main static mockup associated with this secondary static mockup. For example, this node-ids:

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

props follows the {  data, stateInstance } format.

where data type is: {xxx} (supplied by main agent, i.e., state part from README).

`stateInstance._publish(eventId, payload)` can trigger events, where eventId and corresponding event type are: {xxx} (supplied by main agent, i.e., event part from README).

Related types are: {xxx} (supplied by main agent, read from `<typeDirs>/<typeId>/index.ts`).

**Important: NOT all data and event list need to be used. You need to judge which data and event list are useful in the current scenario and use only a part. For example, if this is the forget password scenario, then the "forget password verification code countdown" state is useful, the "forget password set new password button click" event is useful, while the "login verification code countdown" state is not useful, and the "first-time login set new password click" event is not useful.**

**What is secondary scene?**

{xxx} (supplied by main agent).

In the specific scene code (e.g., Page1.tsx), implement the secondary scene code, for example, the reviewing uneditable scene here:

Main scene TSX:

// other code
const {   { name }, stateInstance } = props;
const onEdit = () => {
   stateInstance._publish('Page1.editClick', {}); // When publishing, specify the trigger, i.e., Page1.editClick, not just editClick
}
// other code
<div className="name">{name}</div>
<button onClick={onEdit}>edit</button>
// other code

Secondary scene TSX, representing reviewing scenario:

// other code
<div className="name">Jammy</div>
<button disabled>edit</button>
// other code

Understand that reviewing means graying out the button, then modify the main scene TSX:

// other code
const {   { name, reviewing }, stateInstance } = props;
const onEdit = () => {
   stateInstance._publish('Page1.editClick', {}); // When publishing, specify the trigger, i.e., Page1.editClick, not just editClick
}
// other code
<div className="name">{name}</div>
<button onClick={onEdit} disabled={reviewing}>edit</button>
// other code

The less file changes are similar, ensure all CSS classes in tsx have corresponding definitions in the less file.

Write the changes back to main scene tsx and less files.
```

## Handle storyboard secondary static mockup

Can be handled later.

## Handle toast secondary static mockup

Can be handled later.