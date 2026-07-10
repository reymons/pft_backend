import { ApiProperty } from "@nestjs/swagger";
import { CategoryModel, CategoryType } from "@/categories/categories.model";

export class CategoryRes {
    @ApiProperty()
    id: number;

    @ApiProperty({ enum: CategoryType, nullable: true })
    type: CategoryType | null;

    @ApiProperty({ type: "string", nullable: true })
    customName: string | null;

    constructor(m: CategoryModel) {
        this.id = m.id;
        this.type = m.type;
        this.customName = m.customName;
    }
}
