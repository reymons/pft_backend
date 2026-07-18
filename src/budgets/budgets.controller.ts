import { type FastifyRequest } from "fastify";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { Auth } from "@/auth/auth.guard";
import { BudgetsService } from "./budgets.service";
import { CreateBudgetReq } from "./dto/controller/create-budget";
import { BudgetRes } from "./dto/controller/budget";
import { EditBudgetReq } from "./dto/controller/edit-budget";

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
    @ApiCreatedResponse({ type: BudgetRes })
    async createOne(@Body() body: CreateBudgetReq, @Req() req: FastifyRequest): Promise<BudgetRes> {
        const budget = await this.budgetsService.createBudget({
            userId: req.user.id,
            name: body.name,
            amount: body.amount,
            period: body.period,
            categoryIds: body.categoryIds,
            newCategories: body.newCategories,
        });
        return new BudgetRes(budget);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteOne(@Param("id", ParseIntPipe) id: number, @Req() req: FastifyRequest): Promise<void> {
        await this.budgetsService.deleteBudget({ budgetId: id, userId: req.user.id });
    }

    @Patch(":id")
    @ApiOkResponse({ type: BudgetRes })
    async editOne(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: EditBudgetReq,
        @Req() req: FastifyRequest,
    ): Promise<BudgetRes> {
        const budget = await this.budgetsService.editBudget({
            ...body,
            budgetId: id,
            userId: req.user.id,
        });
        return new BudgetRes(budget);
    }
}
