export class Vec2 {
    static zero(): Vec2 { return new Vec2(0, 0) };

    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    add(other: Vec2): Vec2 {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    sub(other: Vec2): Vec2 {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
    mul(other: number): Vec2 {
        return new Vec2(this.x * other, this.y * other);
    }

    magnitude(): number {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }

    sqrMagnitude(): number {
        return this.x*this.x + this.y*this.y;
    }
}