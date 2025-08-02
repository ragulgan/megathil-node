import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { ContactUs } from "./contactus.schema";
import { ContactUsDto } from "./dto/contactus.dto";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class ContactUsService {
  constructor(
    @InjectModel(ContactUs.name) private contactUsModel: Model<ContactUs>,
    private readonly mailService: MailerService
  ) { }

  async saveContactRequest(contactUsDto: ContactUsDto) {
    contactUsDto.status = 'UNREAD';
    this.mailService.sendMail({
      from: process.env.SMTP_USERNAME,
      to: process.env.CONTACT_EMAIL,
      // to: 'anbarasan@shenll.com',
      subject: `Request received from ${contactUsDto.name}`,
      text: `Message: ${contactUsDto.message}

      by
      ${contactUsDto.name}
      ${contactUsDto.email}`,
    }).then((res) => {
      console.log("Contact received mail sent:", res?.messageId);
    }).catch((e) => {
      console.log("Contact received mail sent:", e);
    })
    return this.contactUsModel.create(contactUsDto);
  }

  async findAll(queryParams: any) {
    const limit = Number(queryParams.limit)
    const page = Number(queryParams.page)
    const skipValue = Number(page - 1) * limit
    let match: any = { status: { $ne: 'DELETED' } }

    if (queryParams.name || queryParams.email || queryParams.mobileNumber) {
      const orCondition = []
      if (queryParams.name) {
        orCondition.push({
          name: new RegExp(`${queryParams.name}`, 'i')
        });
      }

      if (queryParams.email) {
        orCondition.push({
          email: new RegExp(`${queryParams.email}`, 'i')
        });
      }

      if (queryParams.mobileNumber) {
        orCondition.push({
          mobileNumber: new RegExp(`${queryParams.mobileNumber}`, 'i')
        });
      }

      match = { ...match, $or: orCondition }
    }

    if (queryParams.status) {
      match.status = queryParams.status;
    }

    const messages = await this.contactUsModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
    const count = await this.contactUsModel.countDocuments(match).exec()
    return { messages, count };
  }

}