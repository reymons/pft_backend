import { RecurringTrxPeriod, TransactionType } from "../transactions.model";

export type SaveTrxDto = {
    type: TransactionType;
    name: string;
    description?: string;
    amount: number;
    categoryId: number;
    userId: number;
    addedAt: string;
    recurringPeriod?: RecurringTrxPeriod;
};
