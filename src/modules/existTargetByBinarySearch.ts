export const existTargetByBinarySearch = (arr: string[], target: string): boolean => {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (target < arr[mid]) {
      right = mid - 1;
    } else if (target > arr[mid]) {
      left = mid + 1;
    } else {
      return true;
    }
  }
  return false;
}
