import type { FastifyRequest } from "fastify";
import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { Auth } from "@/auth/auth.guard";
import { StatsRepo } from "./stats.repo";
import { TopSpendingCategoryRes } from "./dto/controller/top-spending-category";
import { TopSpendingCategoriesQuery } from "./query/top-spending-categories";
import { SummaryRes } from "./dto/controller/summary";
import { SpendingCategoryTrendRes } from "./dto/controller/spending-category-trend";
import { SpendingCategoryTrendQuery } from "./query/spending-category-trend";

@Controller("stats")
@Auth()
@ApiBearerAuth("JWT")
export class StatsController {
    constructor(private readonly statsRepo: StatsRepo) {}

    @Get("top-spending-categories")
    @ApiOkResponse({ type: TopSpendingCategoryRes, isArray: true })
    async getTopSpendingCategories(
        @Req() req: FastifyRequest,
        @Query() query: TopSpendingCategoriesQuery,
    ): Promise<TopSpendingCategoryRes[]> {
        const categories = await this.statsRepo.getTopSpendingCategories(req.user.id, query);
        return categories.map((c) => new TopSpendingCategoryRes(c));
    }

    @Get("summary")
    @ApiOkResponse({ type: SummaryRes })
    async getSummary(@Req() req: FastifyRequest) {
        const ent = await this.statsRepo.getSummary(req.user.id);
        return new SummaryRes(ent);
    }

    @Get("spending-category-trend")
    @ApiOkResponse({ type: SpendingCategoryTrendRes })
    async getSpendingCategoryTred(@Req() req: FastifyRequest, @Query() query: SpendingCategoryTrendQuery) {
        const trend = await this.statsRepo.getSpendingCategoryTrend(req.user.id, query);
        return trend.map((t) => new SpendingCategoryTrendRes(t));
    }
}
