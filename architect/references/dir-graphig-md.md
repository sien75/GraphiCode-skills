# directory-level graphig.md config files

Each directory (flowDirs, algorithmDirs, stateDirs, typeDirs) contains a config file that briefly summarizes the items within. The format is as follows:

```markdown
# flow

* `id1`: description
* `id2`: description
```

The config file names are:
* `flow.graphig.md` — in flowDirs
* `algorithm.graphig.md` — in algorithmDirs
* `state.graphig.md` — in stateDirs
* `type.graphig.md` — in typeDirs

## special prefix for state descriptions

In `state.graphig.md`, if a state's description starts with `[START] `, it means this state needs to be initialized and executed at the very beginning of the program (i.e., it is a startup state). For example:

```markdown
# state

* `Store`: [START] Manages the global application state
``` 

**So if you determine that a State needs to be initialized at startup, you should prefix its description with `[START]`.**
