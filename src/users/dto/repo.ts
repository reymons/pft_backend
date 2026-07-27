import { Currency } from "@/currency/currency.model";

export type SaveUserDto = {
    name: string;
    password: string;
    defaultCurrency: Currency;
};
