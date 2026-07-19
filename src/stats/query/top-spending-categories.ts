import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";
import { TopSpendingCategoryPeriod } from "../stats.model";

export class TopSpendingCategoriesQuery {
    @ApiProperty({ enum: TopSpendingCategoryPeriod, required: false })
    @IsOptional()
    @IsEnum(TopSpendingCategoryPeriod)
    period = TopSpendingCategoryPeriod.Monthly;

    @ApiProperty()
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(0)
    limit?: number;
}
