import { Module } from "@nestjs/common";
import { CategoriesRepo, CategoriesRepoFactory } from "./categories.repo";
import { CategoriesController } from "./categories.controller";

@Module({
    providers: [CategoriesRepo, CategoriesRepoFactory],
    exports: [CategoriesRepo, CategoriesRepoFactory],
    controllers: [CategoriesController],
})
export class CategoriesModule {}
