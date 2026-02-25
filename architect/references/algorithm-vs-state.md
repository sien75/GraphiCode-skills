# Important: How to distinguish between states and algorithms?

Distinguishing between states and algorithms is very important. GraphiCode draws inspiration from functional programming. In GraphiCode:

* State nodes are declarative nodes, with the core concept of "mapping", and should contain all side effects.
* Algorithm nodes are imperative nodes, with the core concept of "logic", focusing only on how to transform input into output.

## case 1

If the program processes from standard input to standard output, then maintaining standard input and standard output should be the responsibility of states. The standard input state sends an event to notify the algorithm node, and the algorithm node pushes the computation result to the standard output state:

```md
# major
doSomethingA -> doSomethingB -> doSomethingC
# minor
$stdState.stdinEvent -> doSomethingA.input
doSomethingC.result -> @stdState.writeStdout
```

Here, doSomethingA will ultimately correspond to a pure function that only depends on the language engine, while all side effects related to the environment are handled by stdState.

## case 2

In a typical backend application, the receiving and sending of interface data, as well as database reads, are all maintained by specific state nodes.

Look at this example: after receiving the getUserInfoEvent event, it will execute three steps: transform, combine, and generate, with the database's userTable being pulled midway:

```md
# major
transform -> combine -> generate
# minor
$api.getUserInfoEvent -> transform.event
&sqlite.userTable -> combine.userData
generate.result -> @api.response
```

## case 3

For frontend applications, it's the same: the maintenance of DOM nodes (such as a React component) is also done by state nodes. If data format conversion is needed, or logic needs to be executed in response to user events, then algorithm nodes are required.

Consider a search page: the user types a keyword, the app fetches results from an API, and renders them as a list. This involves two state nodes (`searchPage` for DOM, `searchApi` for network) and two separate flows:

Flow 1 — user submits keyword, build and send the request:

```d2
# major
buildRequest
# minor
$searchPage.onSearch -> buildRequest.keyword
buildRequest.request -> @searchApi.fetch
```

Flow 2 — API responds, parse and render the results:

```d2
# major
parseResponse
# minor
$searchApi.onResponse -> parseResponse.response
parseResponse.results -> @searchPage.renderResults
```

All side effects (DOM rendering, network requests) are encapsulated in state nodes, while algorithm nodes are pure data transformations.
