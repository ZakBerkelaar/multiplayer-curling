export class List<T> {
    data: T[];

    constructor() {
        this.data = [];
    }

    get(i: number): T {
        return this.data[i];
    }

    set(i: number, x: T): void {
        this.data[i] = x;
    }

    add(x: T): void {
        this.data.push(x);
    }

    addRange(x: T[]): void {
        for (const iterator of x) {
            this.add(iterator);
        }
    }

    removeAt(i: number): void {
        this.data.splice(i, 1);
    }

    insert(i: number, x: T): void {
        this.data.splice(i, 0, x);
    }

    indexOf(x: T): number {
        let index = -1;
        for (let i = 0; i < this.data.length; i++) {
            const element = this.data[i];
            if (element === x) {
                index = i;
                break;
            }
        }

        return index;
    }

    contains(x: T): boolean {
        return this.indexOf(x) !== -1;
    }

    length(): number {
        return this.data.length;
    }

    remove(x: T): boolean {
        let removed = false;

        for (let i = 0; i < this.data.length; i++) {
            const element = this.data[i];
            if(element === x) {
                removed = true;
                this.data.splice(i, 1);
            }
        }

        return removed;
    }
}