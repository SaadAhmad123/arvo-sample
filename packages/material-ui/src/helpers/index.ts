/**
 * Replaces the placeholders in a string with their corresponding values from a dictionary.
 * The placeholders in the string should be in the format {~<variableName>~}.
 *
 * @param str - The input string with placeholders.
 * @param dictionary - The dictionary containing variableName-value pairs.
 * @returns The string with placeholders replaced by their corresponding values.
 */
export function replacePlaceholders(str: string, dictionary: { [key: string]: string }): string {
  let _str = str;
  for (const key in dictionary) {
    const placeholder = `{~${key}~}`;
    _str = _str.replace(placeholder, dictionary[key]);
  }
  return _str;
}

/**
 * Executes an asynchronous function and returns its result.
 * If the function throws an error, `undefined` is returned instead.
 * This is useful for handling operations that might fail, without the need to explicitly handle the error each time.
 *
 * @template T The type of the value that the async function returns.
 * @param fn An async function that returns a promise.
 * @returns A promise that resolves to the returned value of the async function, or `undefined` if an error occurs.
 */
export async function tryAsyncExecute<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

/**
 * Executes a synchronous function and returns its result.
 * If the function throws an error, `undefined` is returned instead.
 * Similar to `tryAsyncExecute`, this function is useful for handling operations that might fail,
 * but for synchronous functions.
 *
 * @template T The type of the value that the function returns.
 * @param fn A synchronous function.
 * @returns The returned value of the function, or `undefined` if an error occurs.
 */
export function tryExecute<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  return await navigator.clipboard.writeText(text);
}

export function truncateString(text: string, maxLength = 150): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

export function downloadJSON(
  data: Record<string, unknown>,
  fileName: string,
  addTimeAndDate = true,
  onError?: (e: Error) => void,
) {
  try {
    const toDownload = JSON.stringify(data, null, 2);
    const blob = new Blob([toDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Get the current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Format the filename as process_YYYYMMDD:HHMMSS.json
    let filename = `${fileName}.json`;
    if (addTimeAndDate) {
      filename = `${fileName}.${year}${month}${day}_${hours}${minutes}${seconds}.json`;
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    onError?.(e as Error);
  }
}

export const readFile = (file?: File | null) =>
  new Promise<string | undefined>((resolve, reject) => {
    if (!file) {
      resolve(undefined);
      return;
    }
    try {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        resolve(event.target?.result as string | undefined);
        return;
      };
      fileReader.readAsText(file);
    } catch (e) {
      reject(e);
    }
  });
