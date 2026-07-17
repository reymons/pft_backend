import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { SortDirection } from "./sort";

export class PaginationRes {
    @ApiProperty()
    total: number;

    constructor(total: number) {
        this.total = total;
    }
}

export class PaginationQuery {
    @ApiProperty({ required: false })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(0)
    page: number = 0;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    pageSize: number = 20;
}

export class PaginationWithSortQuery extends PaginationQuery {
    @ApiProperty({ required: false, enum: SortDirection })
    @IsOptional()
    @IsEnum(SortDirection)
    dir = SortDirection.DESC;
}
