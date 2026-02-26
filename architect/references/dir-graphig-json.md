# directory-level graphig.json config files

Each directory (flowDirs, algorithmDirs, stateDirs, typeDirs) contains a config file that briefly summarizes the items within. The format is as follows:

```json
{
  id1: "description",
  id2: "description",
  ...
}
```

The config file names are:
* `flow.graphig.json` — in flowDirs
* `algorithm.graphig.json` — in algorithmDirs
* `state.graphig.json` — in stateDirs
* `type.graphig.json` — in typeDirs

## special prefix for state descriptions

In `state.graphig.json`, if a state's description starts with `[START] `, it means this state needs to be initialized and executed at the very beginning of the program (i.e., it is a startup state). For example:

```json
{
  "Store": "[START] Manages the global application state"
}
``` 
