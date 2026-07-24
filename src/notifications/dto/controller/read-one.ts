import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive } from "class-validator";

export class ReadNotificationReq {
    @ApiProperty()
    @IsInt()
    @IsPositive()
    id: number;
}
