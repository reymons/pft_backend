import { ApiProperty } from "@nestjs/swagger";

export class GetUnreadCountRes {
    @ApiProperty()
    count: number;

    constructor(count: number) {
        this.count = count;
    }
}
