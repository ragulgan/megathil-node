import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleService } from './service';
import { Role, RoleSchema } from './schema'; 
import { RoleController } from './controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])],  
  controllers: [RoleController ],
  providers: [RoleService , ResponseService],
  exports: [RoleService],
})
export class RoleModule {}
