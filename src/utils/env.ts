/**
 * Retrieves an environment variable or throws an error if it is missing. Optionally converts the value to a specific
 * type using a transformer function.
 *
 * @param key The name of the environment variable.
 * @param converter An optional function to convert the string value to Type T.
 * @returns The value of the environment variable, converted to Type T.
 */
export function getEnvOrThrow<T = string>(key: string, converter?: (value: string) => T): T {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  // If a converter function is provided, use it
  if (converter) {
    return converter(value);
  }

  // Otherwise, return as string (default)
  return value as unknown as T;
}
