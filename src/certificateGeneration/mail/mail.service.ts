import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST_NAME,
    port: +process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    }
  });

  async sendCertificate(to: string, name: string, certPath: string, courseName = 'AI-Powered Interview Preparation Program') {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Megathil Certificate</title>
    </head>
    <body style="background-color: #f7f6ff; font-family: 'Poppins', sans-serif; margin: 0; padding: 0; width: 100%;">
  <table
    style="width: 100%; max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #4D5CD3, #D18BDD);">
    <tr>
      <td style="padding: 20px;">
        <table style="width: 100%;">
          <tr>
            <td style="width: 50%; vertical-align: left;">
              <a href="https://megathil.com">
                <img src= "${process.env.IMAGE_URL}/fileUpload/read/0ca3a104-f3ca-4ead-8b1a-9d9c614ee29c.png"  style="display: block; width: auto;" class="logo logo_img" alt="Megathil Logo" />
              </a>
            </td>
            <td style="width: 50%; text-align: left; vertical-align: middle;">
              <div style="font-size: 14px; font-weight: bold; line-height: 1.6; color:#ffffff">
                Land your dream Job with Megathil, the<br>
                No.1 AI-driven Career Accelerator!
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <table
    style="width: 100%; max-width: 600px; margin: 0 auto; background-color:#ffffff; border-radius: 8px; padding: 20px 20px 20px 20px;">
    <tr>
      <td
        style="border-top: 3px solid #6A5DD4; padding: 20px; background-color: #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 0px;">
        <table width="100%">
          <tr>
            <td style="font-size: 18px; color: #333333; padding-bottom: 10px; text-align: left;">
              <strong>Dear ${name}</strong>,
            </td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: #333333; line-height: 24px; padding-bottom: 15px;">
              Congratulations on completing the <strong>${courseName}</strong> with Megathil!
            </td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: #000000; line-height: 24px; padding-bottom: 15px;">
              Your certificate is attached to this email. We’re proud of your achievement and excited to see how you’ll
              use this knowledge to reach new heights.
            </td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: #000000; line-height: 24px; padding-bottom: 15px;">
              Thank you for learning with Megathil. We look forward to being a part of your continued journey!
            </td>
          </tr>

          <tr>
            <td style="text-align: center;">
              <img src="cid:certificate_preview" alt="Certificate Preview"
                style="width: 60%; border: 1px solid #ccc; border-radius: 8px;" />
            </td>
          </tr>

          <table
            style="width: 100%; margin: 0 auto; max-width: 600px; background-color: rgb(255, 255, 255); text-align: right;">
            <tr>
              <td style="font-size: 14px; ">Regards</td>
            </tr>
            <tr>
              <td style="font-size: 14px;  padding-bottom: 10px;">The Megathil Team</td>
            </tr>
          </table>
        </table>
      </td>
    </tr>
  </table>
  <table
    style="width: 100%; max-width: 600px; margin: 0 auto; background: #6A5DD4;">
    <tr>
      <td style="padding: 15px;">
        <table style="width: 100%;">
          <tr>
            <!-- Left empty space or content -->
            <td style="width: 60%;"></td>

            <!-- Right-aligned Download Section -->
            <td style="width: 40%; text-align: left; vertical-align: middle;">
              <div style="color: #ffffff; font-size: 12px; font-weight: 600; padding-left: 20px;">
                Download Our App
              </div>
              <div style="padding-top: 10px; padding-left: 20px;">
                <a href="https://play.google.com/store/apps/details?id=com.megathilendeavours.megathil" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/a2f48557-78b8-48f5-99d6-0a17d35d10a9.png" alt="Google Play" style="margin-right: 10px;" />
              </a>
              <a href="https://apps.apple.com/app/megathil/id6636491765" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/cededcd8-8bfc-4ba9-a5b2-170f55a3b4e2.png" alt="App Store" style="margin-right: 10px;" />
              </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
    </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to,
      subject: 'Megathil - Your Certificate of Completion',
      html: htmlContent,
      attachments: [
        {
          filename: `${name}-Megathil-Certificate.png`,
          path: certPath,
          cid: 'certificate_preview'
        },
      ],
    };
    await this.transporter.sendMail(mailOptions);
  }
}
