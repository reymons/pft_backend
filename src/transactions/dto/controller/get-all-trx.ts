import { ApiProperty } from "@nestjs/swagger";
import { PaginationRes } from "@/collection/pagination";
import { TransactionModel } from "@/transactions/transactions.model";
import { TrxRes } from "./trx";

export class GetAllTrxRes extends PaginationRes {
    @ApiProperty({ isArray: true, type: TrxRes })
    data: TrxRes[];

    constructor(data: TransactionModel[], total: number) {
        super(total);
        this.data = data.map((d) => new TrxRes(d));
    }
}
