import { HttpService } from "@/http/http.service";
import { Injectable } from "@nestjs/common";
import { ExchangeRateEntity } from "./currency.entity";
import { Currency } from "./currency.model";

@Injectable()
export class CurrencyClient {
    constructor(private readonly httpService: HttpService) {}

    getExchangeRates(base: Currency, forCurrencies: Currency[], date: string): Promise<ExchangeRateEntity[]> {
        // TODO: validate response
        const quotes = forCurrencies.join(",");
        return this.httpService.get<ExchangeRateEntity[]>(
            `https://api.frankfurter.dev/v2/rates?base=${base}&date=${date}&quotes=${quotes}`,
        );
    }
}
