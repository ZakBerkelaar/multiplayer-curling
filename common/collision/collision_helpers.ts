import { Rectangle } from "../rect.js";
import { Vec2 } from "../vec2.js";

export function pointInRect(p: Vec2, r: Rectangle): boolean {
    if(p.x < r.location.x) return false;
    if(p.x > r.location.x + r.size.x) return false;
    if(p.y < r.location.y) return false;
    if(p.y > r.location.y + r.size.y) return false;
    
    return true;
}