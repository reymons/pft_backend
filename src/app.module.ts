import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { DBModule } from "./db/db.module";
import { JwtModule } from "./jwt/jwt.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CategoriesModule } from "./categories/categories.module";
import { BudgetsModule } from "./budgets/budgets.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { StatsModule } from "./stats/stats.module";
import { WsModule } from "./ws/ws.module";
import { PubsubModule } from "./pubsub/pubsub.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [`.env.${process.env.APP_ENV}`, ".env"],
        }),
        ScheduleModule.forRoot(),
        DBModule,
        WsModule,
        JwtModule,
        PubsubModule,
        AuthModule,
        UsersModule,
        CategoriesModule,
        BudgetsModule,
        TransactionsModule,
        StatsModule,
        NotificationsModule,
    ],
})
export class AppModule {}
