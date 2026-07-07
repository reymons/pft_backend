import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "./jwt.service";

describe("JwtService", () => {
    let service: JwtService;
    const secret = "123";

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: JwtService,
                    useFactory: () => new JwtService(secret),
                },
            ],
        }).compile();

        service = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("creates access token", async () => {
        const userId = 5;
        const token = await service.createAccessToken(userId);
        const user = await service.verifyAccessToken(token);
        expect(user.id).toBe(userId);
    });
});
