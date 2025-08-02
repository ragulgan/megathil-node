import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GemsPackageService } from './gemsPackage.service';
import { GemsPackage, GemsPackageSchema } from './gemsPackage.schema';
import { GemsPackageController } from './gemsPackage.controller';
import { ResponseService } from '../base/controller';
import { GemsPackageCarousel, GemsPackageCarouselSchema } from './gemsPackageCarousel.schema';
import { User, UserSchema } from '../users/users.schema';
import { Transaction, TransactionSchema } from '../transaction/transactions.schema';
import { PromoCode, PromoCodeSchema } from '../Promotors/promotor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GemsPackage.name, schema: GemsPackageSchema }]),
    MongooseModule.forFeature([{ name: GemsPackageCarousel.name, schema: GemsPackageCarouselSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    MongooseModule.forFeature([{ name: PromoCode.name, schema: PromoCodeSchema }])
  ],
  controllers: [GemsPackageController],
  providers: [GemsPackageService, ResponseService],
  exports: [GemsPackageService, MongooseModule],
})
export class GemsPackageModule { }
