import { SummaryEntity } from "@/stats/stats.entity";
import { ApiProperty } from "@nestjs/swagger";

export class SummaryRes {
    @ApiProperty()
    budgets: number;

    @ApiProperty()
    transactions: number;

    @ApiProperty()
    transactionsPrevMonth: number;

    @ApiProperty()
    transactionsThisMonth: number;

    @ApiProperty()
    balance: number;

    @ApiProperty()
    spendingThisMonth: number;

    @ApiProperty()
    spendingPrevMonth: number;

    constructor(ent: SummaryEntity) {
        this.budgets = ent.budgets;
        this.transactions = ent.transactions;
        this.transactionsPrevMonth = ent.transactions_prev_month;
        this.transactionsThisMonth = ent.transactions_this_month;
        this.balance = ent.balance;
        this.spendingThisMonth = ent.spending_this_month;
        this.spendingPrevMonth = ent.spending_prev_month;
    }
}
