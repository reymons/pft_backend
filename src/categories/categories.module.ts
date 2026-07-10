import { Module } from "@nestjs/common";
import { CategoriesRepo, CategoriesRepoFactory } from "./categories.repo";

@Module({
    providers: [CategoriesRepo, CategoriesRepoFactory],
    exports: [CategoriesRepo, CategoriesRepoFactory],
})
export class CategoriesModule {}
