import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CurrencyRepo } from "./currency.repo";
import { CurrencyClient } from "./currency.client";
import { BASE_CURRENCY, CURRENCIES } from "./currency.model";

@Injectable()
export class CurrencyService {
    constructor(
        private readonly currencyClient: CurrencyClient,
        private readonly currencyRepo: CurrencyRepo,
    ) {}

    async ensureExchangeRatesExist(date: string) {
        if (new Date(date) > new Date()) return;
        if (await this.currencyRepo.hasExchangeRates(CURRENCIES, date)) {
            return;
        }
        const rates = await this.currencyClient.getExchangeRates(BASE_CURRENCY, CURRENCIES, date);
        await this.currencyRepo.saveMany(rates);
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    protected async updateCurrencies() {
        let retries = 0;
        const date = new Date().toISOString();
        while (retries++ < 5) {
            try {
                const rates = await this.currencyClient.getExchangeRates(BASE_CURRENCY, CURRENCIES, date);
                await this.currencyRepo.saveMany(rates);
                break;
            } catch (err) {
                console.log(err);
            }
        }
    }
}
