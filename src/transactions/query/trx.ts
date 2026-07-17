import { PaginationWithSortQuery } from "@/collection/pagination";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Length } from "class-validator";
import { TransactionType } from "../transactions.model";
import { TransformToNumberArray } from "@/collection/decorators";

export enum TransactionSortField {
    Date = "date",
}

export class TransactionsQuery extends PaginationWithSortQuery {
    @ApiProperty({ required: false, enum: TransactionSortField })
    @IsOptional()
    @IsEnum(TransactionSortField)
    sortBy = TransactionSortField.Date;

    @ApiProperty({ required: false, enum: TransactionType })
    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @Length(0, 50)
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @Length(0, 50)
    description?: string;

    @ApiProperty({ required: false })
    @TransformToNumberArray()
    @IsOptional()
    @IsInt({ each: true })
    categoryIds?: number[];
}
