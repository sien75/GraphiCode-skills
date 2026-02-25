# flow

## what is flow

`flow` is the **most important concept** in GraphiCode. It chains algorithm nodes together and specifies the dependencies between algorithm nodes and state nodes.

## major process

**Each flow is a specially formatted markdown file, where the line following # major represents the main process, and each node in the main process is an algorithm node.**

For example, this is the simplest flow file, representing the sequential execution of algorithm nodes dir1/a, dir1/b, dir1/c, and dir1/d:

```md
# major
dir1/a -> dir1/b -> dir1/c -> dir1/d
```

## minor process

The main process cannot run by itself and requires minor processes.

**Lines following # minor is minor process, representing that a certain algorithm node in the main process has an effect from / to the state node.**

In details:

* $ represents a subscription.
* & represents a pull.
* @ represents a push.

For example, this means that algorithm node dir1/a subscribes to the event1 event of state dir2/x, and when the event1 event occurs, algorithm dir1/a will start executing:

```md
# minor
$dir2/x.event1 -> dir1/a
```

For example, this means that node dir1/b will call readData1 method from state dir2/y to get some data before execution:

```md
# minor
&dir2/y.readData1 -> dir1/b
```

For example, this means that algorithm node dir1/c will call the writeData2 method of state dir2/z to push some data after execution:

```md
# minor
dir1/c -> @dir2/z.writeData2
```

## a complex example

The last example, dir1/a subscribes to dir2/x.event1, dir1/b calls dir2/y.readData1 to get data during execution, dir1/c and dir1/d are two branches from dir1/b, both calling dir2/z's write methods to push data:

```md
# major
dir1/a -> dir1/b -> dir1/c
dir1/b -> dir1/d

# minor
$dir2/x.event1 -> dir1/a
&dir2/y.readData1 -> dir1/b
dir1/c -> @dir2/z.writeData1
dir1/d -> @dir2/z.writeData2
```

## one major process in one flow file

**Important: Remember, a flow file can only contain one line of flow. If nodes cannot be connect, you should create a separate flow file.**

For example, the following flow file is valid because both major flow lines contain node dir1/b, so they can be connected:

```md
# major
dir1/a -> dir1/b -> dir1/c -> dir1/d
```

The following flow file is **WRONG** because there are 2 lines of flow:

```md
# major
dir1/a -> dir1/b -> dir1/c
dir1/d -> dir1/e
```

## state nodes cannot connect together

The following flow file is **WRONG** because the two state nodes are connected together:

```md
# major
dir1/a -> dir1/b
# minor
$dir2/x.event -> @dir2/y.writeData
```

## minor process can only describe one relationship per line

The following flow file is **WRONG** because it describes two relationships between state and algorithm in one line:

```md
# major
dir1/a -> dir1/b
# minor
$dir2/x.event -> dir1/a -> @dir2/y.writeData
```

## only write in grammars above

**IMPORTANT: Do not write other formats into the flow file, GraphiCode only supports grammars above!**
