import { type FastifyRequest } from "fastify";
import { Body, Controller, Get, Patch, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { Auth } from "@/auth/auth.guard";
import { GetAllNotificationsRes } from "./dto/controller/get-all";
import { NotificationsService } from "./notifications.service";
import { GetUnreadCountRes } from "./dto/controller/get-unread-count";
import { ReadNotificationReq } from "./dto/controller/read-one";

@Controller("notifications")
@ApiBearerAuth("JWT")
@Auth()
export class NotificationsController {
    constructor(private readonly notifService: NotificationsService) {}

    @Get()
    @ApiOkResponse({ type: GetAllNotificationsRes })
    async getAll(@Req() req: FastifyRequest) {
        const res = await this.notifService.getAllByUserId(req.user.id);
        return new GetAllNotificationsRes(res.data, res.total);
    }

    @Get("unread")
    @ApiOkResponse({ type: GetUnreadCountRes })
    async getUnreadCount(@Req() req: FastifyRequest) {
        const count = await this.notifService.getUnreadCount(req.user.id);
        return new GetUnreadCountRes(count);
    }

    @Patch("read/all")
    @ApiOkResponse()
    async readMany(@Req() req: FastifyRequest) {
        await this.notifService.readAll(req.user.id);
    }

    @Patch("read")
    @ApiOkResponse()
    async readOne(@Req() req: FastifyRequest, @Body() body: ReadNotificationReq) {
        await this.notifService.readOne(body.id, req.user.id);
    }
}
