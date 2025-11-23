import { Module } from "@nestjs/common";
import { UserRoleService } from "./userrole.service";
import { UserRoleController } from "./userrole.controller";


@Module({
    imports: [],
    controllers: [UserRoleController],
    providers: [UserRoleService],
})
export class UserroleModule {}