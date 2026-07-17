import { CategoryRes } from "@/categories/dto/controller/category";
import { ApiProperty } from "@nestjs/swagger";
import { RecurringTrxPeriod, TransactionModel, TransactionType } from "@/transactions/transactions.model";

export class TrxRes {
    @ApiProperty()
    id: number;

    @ApiProperty({ enum: TransactionType })
    type: TransactionType;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    amount: number;

    @ApiProperty({ type: CategoryRes })
    category: CategoryRes;

    @ApiProperty({ enum: RecurringTrxPeriod, nullable: true })
    recurringPeriod: RecurringTrxPeriod | null;

    @ApiProperty()
    createdAt: string;

    constructor(trx: TransactionModel) {
        this.id = trx.id;
        this.type = trx.type;
        this.name = trx.name;
        this.description = trx.description;
        this.amount = trx.amount;
        this.category = trx.category;
        this.recurringPeriod = trx.recurringPeriod;
        this.createdAt = trx.createdAt;
    }
}
