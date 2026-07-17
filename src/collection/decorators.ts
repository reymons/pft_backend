import { Transform } from "class-transformer";

export function TransformToNumberArray() {
    return Transform(({ value }) => {
        if (typeof value !== "string") return;
        return value.split(",").map(Number);
    });
}
