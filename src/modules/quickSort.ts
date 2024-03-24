export const quickSort = (arr: string[], startID: number, endID: number): string[] => {
  const pivot = arr[Math.floor((startID + endID) / 2)];
  let left = startID, right = endID;
  while (true) {
    while (arr[left] < pivot) {
      left++;
    }
    while (pivot < arr[right]) {
      right--;
    }
    if (right <= left) {
      break;
    }
    const tmp = arr[left];
    arr[left] = arr[right];
    arr[right] = tmp;
    left++;
    right--;
  }
  if (0 < left - 1) {
    quickSort(arr, 0, left - 1);
  }
  if (right + 1 < endID) {
    quickSort(arr, right + 1, endID);
  }
  return arr;
}