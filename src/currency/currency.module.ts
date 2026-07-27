import { Module } from "@nestjs/common";
import { HttpModule } from "@/http/http.module";
import { CurrencyService } from "./currency.service";
import { CurrencyRepo, CurrencyRepoFactory } from "./currency.repo";
import { CurrencyClient } from "./currency.client";

@Module({
    imports: [HttpModule],
    providers: [CurrencyService, CurrencyRepo, CurrencyClient, CurrencyRepoFactory],
    exports: [CurrencyService, CurrencyClient, CurrencyRepoFactory],
})
export class CurrencyModule {}
