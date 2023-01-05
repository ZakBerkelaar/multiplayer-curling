import { Vec2 } from "./vec2.js";

export class Rectangle {
    static zero(): Rectangle { return new Rectangle(Vec2.zero(), Vec2.zero()) };

    location: Vec2;
    size: Vec2;

    constructor(location: Vec2 = Vec2.zero(), size: Vec2 = Vec2.zero()) {
        this.location = location;
        this.size = size;
    }
}