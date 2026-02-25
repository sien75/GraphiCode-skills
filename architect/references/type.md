# type

Currently, type files are TypeScript files.

Types can depend on each other, you can use **"import xx from xxx_dir"** to import other type.

Types must "type typeName = xxx;\nexport default typeName" one type, and typeName must be the same as the type id (including matching case).
