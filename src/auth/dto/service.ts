import { Currency } from "@/currency/currency.model";

export type SignInDto = {
    name: string;
    password: string;
};

export type SignUpDto = SignInDto & {
    defaultCurrency: Currency;
};
