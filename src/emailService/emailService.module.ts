import { Module } from '@nestjs/common';
import { EmailService } from './emailService.service';
import { ResponseService } from '../base/controller';
import { MailerModule } from '@nestjs-modules/mailer';
import * as path from 'path'; 

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST_NAME,
        port: +process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      defaults: {
        from: process.env.SMTP_USERNAME,
      },
      template: {
        dir: path.join(__dirname, './templates'),
        // adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailService, ResponseService],
  exports: [EmailService],
})
export class EmailServiceModule {}