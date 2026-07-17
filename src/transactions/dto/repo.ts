import { RecurringTrxPeriod, TransactionType } from "../transactions.model";

export type SaveTrxDto = {
    type: TransactionType;
    name: string;
    description?: string;
    amount: number;
    categoryId: number;
    userId: number;
    recurringPeriod?: RecurringTrxPeriod;
};
