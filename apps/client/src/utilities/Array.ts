/**
 * Returns all objects from arr1 whose "id" is not found in arr2.
 * @param arr1 - The array to filter.
 * @param arr2 - The array whose ids should be excluded.
 * @returns An array of objects from arr1 whose id doesn't exist in arr2.
 */
export function DifferenceById<T extends { id: string }>(arr1: T[], arr2: T[]): T[] {
  const idsInArr2 = new Set(arr2.map(item => item.id));
  return arr1.filter(item => !idsInArr2.has(item.id));
}