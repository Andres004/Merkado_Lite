import { Module } from '@nestjs/common';
import { UserPenaltyService } from './userpenalty.service';
import { UserPenaltyController } from './userpenalty.controller';

@Module({
  controllers: [UserPenaltyController],
  providers: [UserPenaltyService],
})
export class UserPenaltyModule {}