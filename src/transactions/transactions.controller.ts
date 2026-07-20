import { type FastifyRequest } from "fastify";
import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { Auth } from "@/auth/auth.guard";
import { TrxRes } from "./dto/controller/trx";
import { CreateTrxReq } from "./dto/controller/create-trx";
import { TransactionsService } from "./transactions.service";
import { TransactionsQuery } from "./query/trx";
import { GetAllTrxRes } from "./dto/controller/get-all-trx";

@Controller("transactions")
@Auth()
@ApiBearerAuth("JWT")
export class TransactionsController {
    constructor(private readonly trxService: TransactionsService) {}

    @Post()
    @ApiCreatedResponse({ type: TrxRes })
    async createOne(@Body() body: CreateTrxReq, @Req() req: FastifyRequest): Promise<TrxRes> {
        const trx = await this.trxService.createTransaction({
            type: body.type,
            name: body.name,
            description: body.description,
            amount: body.amount,
            recurringPeriod: body.recurringPeriod,
            userId: req.user.id,
            categoryId: body.categoryId,
            addedAt: body.addedAt,
        });
        return new TrxRes(trx);
    }

    @Get()
    @ApiOkResponse({ type: GetAllTrxRes })
    async getAll(@Query() query: TransactionsQuery, @Req() req: FastifyRequest): Promise<GetAllTrxRes> {
        const data = await this.trxService.getTransactions(req.user.id, query);
        return new GetAllTrxRes(data.data, data.total);
    }
}
