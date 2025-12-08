import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionService } from './transactions.service';
import { Transaction, TransactionSchema } from './transactions.schema';
import { TransactionController } from './transactions.controller';
import { ResponseService } from '../base/controller';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    forwardRef(() => UserModule),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, ResponseService],
  exports: [TransactionService, MongooseModule],
})
export class TransactionModule {}
