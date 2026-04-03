/**
 * Get a value from an array of { key, value } objects by key.
 * @param args - Array of { key, value } objects
 * @param key - The key to search for
 * @returns The value associated with the key, or undefined if not found
 */
export function getArg<T = any>(args: { key: string; value: any }[], key: string): T | undefined {
  return args.find(a => a.key === key)?.value as T;
}

export default getArg;