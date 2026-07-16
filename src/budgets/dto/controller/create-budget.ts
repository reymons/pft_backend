import { ApiProperty } from "@nestjs/swagger";
import {
    IsArray,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from "class-validator";
import { BudgetPeriod } from "@/budgets/budgets.model";

export class CreateBudgetReq {
    @ApiProperty()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    name: string;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Max(1_000_000_000)
    amount: number;

    @ApiProperty({ enum: BudgetPeriod })
    @IsEnum(BudgetPeriod)
    period: BudgetPeriod;

    @ApiProperty({ isArray: true, type: "number", required: false })
    @IsInt({ each: true })
    @IsOptional()
    categoryIds?: number[];

    @ApiProperty({ isArray: true, type: "string", required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    newCategories?: string[];
}
