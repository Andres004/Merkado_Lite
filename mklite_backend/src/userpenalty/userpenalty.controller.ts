import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from "@nestjs/common";
import { UserPenaltyService } from "./userpenalty.service";
import { UserPenalty } from "src/entity/userpenalty.entity";

@Controller('user-penalty')
export class UserPenaltyController {
  constructor(private readonly userPenaltyService: UserPenaltyService) {}

    @Post()
    async createUserPenalty(@Body() penalty: UserPenalty) {
        return this.userPenaltyService.createUserPenalty(penalty);
    }

    @Get()
    async getAllUserPenalties() {
        return this.userPenaltyService.getAllUserPenalties();
    }

    @Get('/:id')
    async getUserPenaltyById(@Param('id', ParseIntPipe) id: number) {
        return this.userPenaltyService.getUserPenaltyById(id);
    }

    @Put('/:id')
    async updateUserPenalty(
        @Param('id', ParseIntPipe) id: number, 
        @Body() updateData: Partial<UserPenalty>
    ) {
        return this.userPenaltyService.updateUserPenalty(id, updateData);
    }

    @Delete('/:id')
    async deleteUserPenalty(@Param('id', ParseIntPipe) id: number) {
        return this.userPenaltyService.deleteUserPenalty(id);
    }
}
