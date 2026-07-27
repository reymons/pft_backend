import { Currency } from "@/currency/currency.model";

export type UserEntity = {
    id: number;
    name: string;
    password: string;
    created_at: string;
    default_currency: Currency;
};
