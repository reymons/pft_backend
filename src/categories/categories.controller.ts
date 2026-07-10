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
import { CategoryRes } from "./dto/controller/category";
import { CategoriesRepo } from "./categories.repo";
import { PatchCategoryReq } from "./dto/controller/patch-category";
import { CreateCategoryReq } from "./dto/controller/create-category";

@Controller("categories")
@ApiBearerAuth("JWT")
export class CategoriesController {
    constructor(private readonly categoriesRepo: CategoriesRepo) {}

    @Get()
    @Auth()
    @ApiOkResponse({ type: CategoryRes })
    async getAll(@Req() req: FastifyRequest): Promise<CategoryRes[]> {
        const categories = await this.categoriesRepo.getAllByUserId(req.user.id);
        return categories.map((c) => new CategoryRes(c));
    }

    @Get("default")
    @ApiOkResponse({ type: CategoryRes })
    async getAllDefault(): Promise<CategoryRes[]> {
        const categories = await this.categoriesRepo.getAllDefault();
        return categories.map((c) => new CategoryRes(c));
    }

    @Post()
    @Auth()
    @ApiCreatedResponse({ type: CategoryRes })
    async createOne(@Req() req: FastifyRequest, @Body() body: CreateCategoryReq): Promise<CategoryRes> {
        const ent = await this.categoriesRepo.save(req.user.id, body.name);
        return new CategoryRes(ent);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    @Auth()
    async deleteOne(@Param("id", ParseIntPipe) id: number, @Req() req: FastifyRequest): Promise<void> {
        await this.categoriesRepo.delete(id, req.user.id);
    }

    @Patch(":id")
    @Auth()
    @ApiOkResponse({ type: CategoryRes })
    async patchOne(
        @Param("id", ParseIntPipe) id: number,
        @Req() req: FastifyRequest,
        @Body() body: PatchCategoryReq,
    ): Promise<CategoryRes> {
        const category = await this.categoriesRepo.patch(id, req.user.id, body.name);
        return new CategoryRes(category);
    }
}
