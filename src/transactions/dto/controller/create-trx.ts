import { RecurringTrxPeriod, TransactionType } from "@/transactions/transactions.model";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, Length, Max, Min } from "class-validator";

export class CreateTrxReq {
    @ApiProperty()
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty()
    @IsString()
    @Length(1, 50)
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @Length(1, 50)
    description?: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @Min(1)
    @Max(1_000_000)
    amount: number;

    @ApiProperty({ enum: RecurringTrxPeriod })
    @IsEnum(RecurringTrxPeriod)
    @IsOptional()
    recurringPeriod?: RecurringTrxPeriod;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    categoryId: number;
}
