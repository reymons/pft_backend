import { ApiProperty } from "@nestjs/swagger";
import { UserModel } from "../users.model";

export class UserRes {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    createdAt: string;

    constructor(u: UserModel) {
        this.id = u.id;
        this.name = u.name;
        this.createdAt = u.createdAt;
    }
}
