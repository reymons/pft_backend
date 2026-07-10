import { type FastifyRequest } from "fastify";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { Auth } from "@/auth/auth.guard";
import { BudgetsService } from "./budgets.service";
import { CreateBudgetRes, CreateBudgetReq } from "./dto/controller/create-budget";
import { BudgetRes } from "./dto/controller/budget";

@Controller("budgets")
@Auth()
@ApiBearerAuth("JWT")
export class BudgetsController {
    constructor(private readonly budgetsService: BudgetsService) {}

    @Get()
    @ApiOkResponse({ type: BudgetRes, isArray: true })
    async getAll(@Req() req: FastifyRequest): Promise<BudgetRes[]> {
        const budgets = await this.budgetsService.getBudgets(req.user.id);
        return budgets.map((b) => new BudgetRes(b));
    }

    @Post()
    @ApiCreatedResponse({ type: CreateBudgetRes })
    async createOne(@Body() body: CreateBudgetReq, @Req() req: FastifyRequest): Promise<CreateBudgetRes> {
        const budget = await this.budgetsService.createBudget({
            userId: req.user.id,
            amount: body.amount,
            period: body.period,
            categoryIds: body.categoryIds,
            newCategories: body.newCategories,
        });
        return new CreateBudgetRes(budget);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    //@ApiResponse({ status: HttpStatus.NO_CONTENT })
    async deleteOne(@Param("id", ParseIntPipe) id: number, @Req() req: FastifyRequest): Promise<void> {
        await this.budgetsService.deleteBudget({ budgetId: id, userId: req.user.id });
    }
}
