import { type FastifyRequest } from "fastify";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { Auth } from "@/auth/auth.guard";
import { BudgetsService } from "./budgets.service";
import { CreateBudgetRes, CreateBudgetReq } from "./dto/controller/create-budget";
import { ApiBearerAuth, ApiCreatedResponse } from "@nestjs/swagger";

@Controller("budgets")
@Auth()
@ApiBearerAuth("JWT")
export class BudgetsController {
    constructor(private readonly budgetsService: BudgetsService) {}

    @Post()
    @ApiCreatedResponse({ type: CreateBudgetRes })
    async createBudget(@Body() body: CreateBudgetReq, @Req() req: FastifyRequest): Promise<CreateBudgetRes> {
        const budget = await this.budgetsService.createBudget({
            userId: req.user.id,
            amount: body.amount,
            period: body.period,
            categoryIds: body.categoryIds,
            newCategories: body.newCategories,
        });
        return new CreateBudgetRes(budget);
    }
}
