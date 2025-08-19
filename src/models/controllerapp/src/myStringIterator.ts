export class MyStringIterator {
  private currentArray: string[] = [];
  private currentIndex: number = 0;

  constructor(array: string[]) {
    if (!Array.isArray(array)) {
      return;
    }
    this.currentArray = array.slice();
    this.currentIndex = 0;
  }

  count(): number {
    return this.currentArray.length;
  }

  next(): string | null {
    if (this.currentIndex >= this.currentArray.length) {
      this.clear();
      return null;
    }
    const nextiTEM = this.currentArray[this.currentIndex];
    this.currentIndex++;
    return nextiTEM;
  }

  private clear() {
    this.currentArray = [];
    this.currentIndex = 0;
  }
}
