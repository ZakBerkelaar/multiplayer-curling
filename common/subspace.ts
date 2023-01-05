import { Rectangle } from "./rect.js";
import { Vec2 } from "./vec2.js";
import { pointInRect } from "./collision/collision_helpers.js"

export class Subspace {
    bounds: Rectangle

    constructor(bounds: Rectangle) {
        this.bounds = bounds;
    }

    pointInSubspace(p: Vec2): boolean
    {
        return pointInRect(p, this.bounds);
    }
}