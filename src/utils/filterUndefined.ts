export function filterUndefined<T>(data: Partial<T>): Partial<T> {
    const filteredData: Partial<T> = {};
    for (const key in data) {
      const key_assert = key as keyof T;
      if (data[key_assert] !== undefined) {
        filteredData[key_assert] = data[key_assert];
      }
    }
    return filteredData;
  }
  