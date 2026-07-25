import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class SpendingCategoryTrendQuery {
    @ApiProperty()
    @IsDateString()
    startDate: string;

    @ApiProperty()
    @IsDateString()
    endDate: string;

    @ApiProperty()
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(0)
    limit?: number;
}
