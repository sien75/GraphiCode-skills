# read
## get
> string
any

# write
## set
> string, any
## delete
> string

# resides-in
memory

# description
Store is the global store of a GraphiCode-managed project. It holds key-value pairs in memory. Global variables use plain keys, and temporary variables use scoped keys (e.g. "scopeId:key") by convention.
