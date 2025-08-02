import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoCodeService } from './promotor.service';
import { PromoCode, PromoCodeSchema } from './promotor.schema';
import { PromotorController } from './promotor.controller';
import { ResponseService } from '../base/controller';
import { EmailServiceModule } from '../emailService/emailService.module';
import { User, UserSchema } from '../users/users.schema';
import { SystemVariables, SystemVariablesSchema } from '../systemVariables/systemVariables.schema';
import { PromotorActivity, PromotorActivitySchema } from './promotor.Activities.schema';
import { UserActivity, UserActivitySchema } from '../users/usersActivites.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PromoCode.name, schema: PromoCodeSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: SystemVariables.name, schema: SystemVariablesSchema }]),
    MongooseModule.forFeature([{ name: PromotorActivity.name, schema: PromotorActivitySchema }]),
    MongooseModule.forFeature([{ name: UserActivity.name, schema: UserActivitySchema }]),
    EmailServiceModule,
  ],
  controllers: [PromotorController],
  providers: [PromoCodeService, ResponseService],
  exports: [PromoCodeService],
})
export class PromotorModule {}
