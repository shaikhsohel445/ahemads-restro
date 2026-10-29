import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import {
  LeadsAdminController,
  PublicLeadsController,
} from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [EmailModule],
  controllers: [PublicLeadsController, LeadsAdminController],
  providers: [LeadsService],
})
export class LeadsModule {}
