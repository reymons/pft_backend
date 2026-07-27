import { Currency } from "./currency.model";

export type ExchangeRateEntity = {
    date: string;
    base: Currency;
    quote: Currency;
    rate: number;
};
