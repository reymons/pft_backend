import { DB_CLIENT, DB_HELPERS, type DBClient, type DBHelpers } from "@/db/db.client";
import { Inject, Injectable } from "@nestjs/common";
import { ExchangeRateEntity } from "./currency.entity";
import { Currency } from "./currency.model";

@Injectable()
export class CurrencyRepoFactory {
    constructor(@Inject(DB_HELPERS) private readonly helpers: DBHelpers) {}

    createRepo(db: DBClient) {
        return new CurrencyRepo(db, this.helpers);
    }
}

@Injectable()
export class CurrencyRepo {
    constructor(
        @Inject(DB_CLIENT) private readonly db: DBClient,
        @Inject(DB_HELPERS) private readonly helpers: DBHelpers,
    ) {}

    async saveMany(rates: ExchangeRateEntity[]): Promise<void> {
        if (!rates.length) return;
        const data = rates.map((rate) => ({
            currency: rate.quote,
            usd_rate: rate.rate,
            rate_date: rate.date,
        }));
        const cs = new this.helpers.ColumnSet(["currency", "usd_rate", "rate_date"], { table: "exchange_rates" });
        const query = this.helpers.insert(data, cs);
        await this.db.none(`${query} ON CONFLICT (currency, rate_date) DO NOTHING`);
    }

    async hasExchangeRates(currencies: Currency[], date: string) {
        const row = await this.db.one<{ count: number }>(
            "SELECT count(*)::int FROM exchange_rates WHERE currency = ANY($1::currency_code[]) AND rate_date = $2::date",
            [currencies, date],
        );
        return row.count === currencies.length;
    }
}
