import { Body, Controller, Delete, Get, Post, Put } from "@nestjs/common";
import { UserPenaltyService } from "./userpenalty.service";
import { UserPenalty } from "src/entity/userpenalty.entity";

@Controller('userpenalty')
export class UserPenaltyController {
  constructor(private readonly userPenaltyService: UserPenaltyService) {}
    @Post()
    async createUserPenalty(@Body() UserPenalty: UserPenalty) {
        return this.userPenaltyService.createUserPenalty(UserPenalty);
    }

    @Get()
    async getAllUserPenalties() {
        return this.userPenaltyService.getAllUserPenalties();
    }

    @Get('/:id_sancion')
    async getUserPenaltyById(@Body('id_sancion') id_sancion: number) {
        return this.userPenaltyService.getUserPenaltyById(id_sancion);
    }

    @Put('/:id_sancion')
    async updateUserPenalty(@Body('id_sancion') id_sancion: number, @Body() userPenaltyUpdate: Partial<UserPenalty>) {
        return this.userPenaltyService.updateUserPenalty(id_sancion, userPenaltyUpdate);
    }

    @Delete('/:id_sancion')
    async deleteUserPenalty(@Body('id_sancion') id_sancion: number) {
        return this.userPenaltyService.deleteUserPenalty(id_sancion);
    }
}
