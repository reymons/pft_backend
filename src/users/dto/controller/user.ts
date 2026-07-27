import { ApiProperty } from "@nestjs/swagger";
import { UserModel } from "@/users/users.model";
import { Currency } from "@/currency/currency.model";

export class UserRes {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    createdAt: string;

    @ApiProperty({ enum: Currency })
    defaultCurrency: Currency;

    constructor(u: UserModel) {
        this.id = u.id;
        this.name = u.name;
        this.createdAt = u.createdAt;
        this.defaultCurrency = u.defaultCurrency;
    }
}
