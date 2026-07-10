import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCategoryReq {
    @ApiProperty()
    @IsString()
    name: string;
}
