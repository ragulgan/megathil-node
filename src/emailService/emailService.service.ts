import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) { }

  private emailTemplates = {
    user: (name: string, message: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body style="background-color: #f7f6ff; font-family: 'Poppins', sans-serif; margin: 0; padding: 0; width: 100%; ">
        <table style="width: 100%; margin: 0 auto; padding: 0; max-width: 600px; background-color: #f7f6ff; border: none;   border-collapse: collapse;">
          <tr style="background: linear-gradient(to left, #5D5CCA, #C975DC);">
            <td style="padding: 30px 0; text-align: left;">
              <a href="https://megathil.com">
                <img src= "${process.env.IMAGE_URL}/fileUpload/read/0ca3a104-f3ca-4ead-8b1a-9d9c614ee29c.png"  style="display: block; margin-left: 24px; width: auto;" class="logo logo_img" alt="Megathil Logo" />
            </a>
            </td>
          </tr>
        </table>
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff; padding: 20px 20px 0px 20px;">
          <tr>
            <th style="font-size: 18px; padding-bottom: 15px; text-align: left;">Hi, ${name}!</th>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              ${message}
            </td>
          </tr>
        </table>
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff; border-top: 2px solid #645ECB;     padding: 20px 20px 0px 20px;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Welcome to Megathil! We’re beyond excited to have you as part of our community. As a special welcome gift, we've credited 50 free gems to your account to help you get started on your learning journey.
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Here’s what’s waiting for you:
            </td>
          </tr>
        </table>
        <table
          style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff;     padding: 0px 20px 0px 20px;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 10px;">
              <ul style="list-style-type: none; padding-left: 0;">
                <li style="padding-bottom: 10px;">
                  <b>Engaging Learning:</b> Dive into quick, fun, and interactive lessons designed to boost your interview
                  skills.
                </li>
                <li style="padding-bottom: 10px;">
                  <b>Track Your Progress:</b> Earn points, badges, and keep up with your learning streaks.
                </li>
                <li>
                  <b>Community Connection:</b> Join millions of learners like you and share your journey.
                </li>
              </ul>
            </td>
          </tr>
        </table>
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff; padding: 0px 20px 0px 20px;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Why wait? Dive into your first lesson now and start unlocking new skills.
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              If you have any questions, we’re here to help. Just reply to this email, and we’ll get back to you!
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Please let us know if there is anything that we can do for you and our team is ready to support!
            </td>
          </tr>
        </table>
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff;">
          <tr>
            <td style="text-align: center; color: #645ECB; font-size: 18px; font-weight: bold; padding: 20px 0;">
              Happy learning,
            </td>
          </tr>
        </table>
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff; text-align: right;">
          <tr>
            <td style="font-size: 16px; padding-right: 30px;">Kind regards</td>
          </tr>
          <tr>
            <td style="font-size: 16px; padding-right: 30px; padding-bottom: 20px;">The Megathil Team</td>
          </tr>
        </table>
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background: linear-gradient(to left, #5D5CCA, #C975DC);">
          <tr>
            <th style="font-size: 16px; font-weight: 600; color: #ffffff; text-align: right; padding: 20px 30px;">Download Our
              App</th>
          </tr>
          <tr>
            <td style="text-align: right; padding: 0px 30px;">
              <a href="https://play.google.com/store/apps/details?id=com.megathilendeavours.megathil" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/a2f48557-78b8-48f5-99d6-0a17d35d10a9.png" alt="Google Play" style="margin-right: 10px;" />
              </a>
              <a href="https://apps.apple.com/app/megathil/id6636491765" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/cededcd8-8bfc-4ba9-a5b2-170f55a3b4e2.png" alt="App Store" style="margin-right: 10px;" />
              </a>
            </td>
          </tr>
        </table>
      </body>
    </html>
      `,
    staff: (name: string, message: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Megathil Welcome Email</title>
      </head>
      <body style="background-color: #f7f6ff; font-family: 'Poppins', sans-serif; margin: 0; padding: 0; width: 100%; ">
        <!-- Header Table -->
        <table
          style="width: 100%; margin: 0 auto; padding: 0; max-width: 600px; background-color: #f7f6ff; border: none;   border-collapse: collapse;">
          <tr style="background: linear-gradient(to left, #5D5CCA, #C975DC);">
            <td style="padding: 30px 0; text-align: left;">
              <a href="https://megathil.com">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/0ca3a104-f3ca-4ead-8b1a-9d9c614ee29c.png" style="display: block; margin-left: 24px; width: auto;"
                  class="logo logo_img" alt="Megathil Logo" />
              </a>
            </td>
          </tr>
        </table>
        <!-- Introductory Section -->
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff; padding: 20px 20px 0px 20px;">
          <tr>
            <th style="font-size: 18px; padding-bottom: 15px; text-align: left;">Hi, ${name}!</th>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              ${message}
            </td>
          </tr>
        </table>
        <!-- What's Expected Section -->
        <table
          style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff; border-top: 2px solid #645ECB; padding: 20px 20px 0px 20px;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">Here’s what to expect as a member of our
              team:</td>
          </tr>
        </table>
        <!-- List Section -->
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff; padding: 0 20px;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              <ul style="list-style-type: none; padding-left: 0;">
                <li style="padding-bottom: 10px;">
                  <b>Collaboration:</b> Work alongside talented professionals who are passionate about shaping the future of
                  interview learning.
                </li>
                <li style="padding-bottom: 10px;">
                  <b>Innovation:</b> Share your ideas and help us create interactive content that makes learning fun and
                  impactful.
                </li>
                <li style="padding-bottom: 10px;">
                  <b>Growth:</b> We’re committed to your professional development and can’t wait to see what we’ll achieve
                  together.
                </li>
              </ul>
            </td>
          </tr>
        </table>
        <!-- Call to Action Section -->
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff; padding: 0px 20px 0px 20px;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Ready to get started? <a href="https://megathilprod.web.app/auth/login"
                style="color: #645ecb; text-decoration: none;">Log in to your account here.</a>
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              If you have any questions, feel free to reach out. We're here to support you every step of the way!
            </td>
          </tr>
        </table>
        <!-- Closing Section -->
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff;">
          <tr>
            <td style="text-align: center; color: #645ECB; font-size: 18px; font-weight: bold; padding: 20px 0;">
              <b>Looking forward to working with you,</b>
            </td>
          </tr>
        </table>
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #ffffff; text-align: right;">
          <tr>
            <td style="font-size: 16px; padding-right: 30px;">Kind regards</td>
          </tr>
          <tr>
            <td style="font-size: 16px; padding-right: 30px; padding-bottom: 20px;">The Megathil Team</td>
          </tr>
        </table>
        <!-- App Download Section -->
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background: linear-gradient(to left, #5D5CCA, #C975DC);">
          <tr>
            <th style="font-size: 16px; font-weight: 600; color: #ffffff; text-align: right; padding: 20px 30px;">Download Our
              App</th>
          </tr>
          <tr>
            <td style="text-align: right; padding: 0px 30px;">
              <a href="https://play.google.com/store/apps/details?id=com.megathilendeavours.megathil" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/a2f48557-78b8-48f5-99d6-0a17d35d10a9.png" alt="Google Play" style="margin-right: 10px;" />
              </a>
              <a href="https://apps.apple.com/app/megathil/id6636491765" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/cededcd8-8bfc-4ba9-a5b2-170f55a3b4e2.png" alt="App Store" style="margin-right: 10px;" />
              </a>
            </td>
          </tr>
        </table>    
      </body>
      </html>
      `,
    interviewer: (name: string, message: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Megathil Welcome Email</title>
      </head>
      <body style="background-color: #f7f6ff; font-family: 'Poppins', sans-serif; margin: 0; padding: 0; width: 100%;">
        <!-- Header Section -->
        <table
          style="width: 100%; margin: 0 auto; padding: 0; max-width: 600px; background-color: #f7f6ff; border: none;   border-collapse: collapse;">
          <tr style="background: linear-gradient(to left, #5D5CCA, #C975DC);">
            <td style="padding: 30px 0; text-align: left;">
              <a href="https://megathil.com">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/0ca3a104-f3ca-4ead-8b1a-9d9c614ee29c.png" style="display: block; margin-left: 24px; width: auto;"
                  class="logo logo_img" alt="Megathil Logo" />
              </a>
            </td>
          </tr>
        </table>
        <!-- Welcome Section -->
        <table style="background-color: #ffffff; padding: 20px; width: 100%; max-width: 600px; margin: 0 auto;">
          <tr>
            <th style="font-size: 18px; padding-bottom: 15px; text-align: left;">Hi, ${name}!</th>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              ${message}
            </td>
          </tr>
        </table>
        <!-- What's Ahead Section -->
        <table
          style="background-color: #ffffff; border-top: 2px solid #645ECB; padding: 20px 20px 10px 20px; width: 100%; max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">Here’s what’s ahead:</td>
          </tr>
        </table>
        <!-- List Section -->
        <table style="background-color: #ffffff; padding: 0 20px; width: 100%; max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              <li style="padding-bottom: 10px;">
                <b>Impactful Guidance :</b> Provide valuable feedback and guidance to learners as they practice and refine
                their interview skills.
              </li>
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              <li style="padding-bottom: 10px;">
                <b>Expert Community :</b> Connect with other professionals and share insights that can help shape the next
                generation of interviewers.
              </li>
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 2px;">
              <li style="padding-bottom: 10px;">
                <b>Flexibility :</b> Enjoy the freedom to contribute on your schedule while making a meaningful difference in
                people’s careers.
              </li>
            </td>
          </tr>
        </table>
        <!-- Call to Action Section -->
        <table style="background-color: #ffffff; padding: 20px; width: 100%; max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Ready to dive in? <a href="https://megathilprod.web.app/auth/login"
                style="color: #645ecb; text-decoration: none;">Log in to your account here.</a>
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              We’re excited to work with you and can’t wait to see the impact you'll make!
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Feel free to reach out if you have any questions. We’re here to help.
            </td>
          </tr>
        </table>
        <!-- Closing Section -->
        <table style="background-color: #ffffff; padding: 20px; width: 100%; max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="text-align: center; color: #645ECB; font-size: 18px; font-weight: bold;">
              <b>Looking forward to working with you,</b>
            </td>
          </tr>
        </table>
        <!-- Signature Section -->
        <table
          style="background-color: #ffffff; padding: 20px; width: 100%; max-width: 600px; margin: 0 auto; text-align: right;">
          <tr>
            <td style="font-size: 16px; padding-right: 30px;">Kind regards</td>
          </tr>
          <tr>
            <td style="font-size: 16px; padding-right: 30px; padding-bottom: 20px;">The Megathil Team</td>
          </tr>
        </table>
        <!-- App Download Section -->
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background: linear-gradient(to left, #5D5CCA, #C975DC);">
          <tr>
            <th style="font-size: 16px; font-weight: 600; color: #ffffff; text-align: right; padding: 20px 30px;">Download Our
              App</th>
          </tr>
          <tr>
            <td style="text-align: right; padding: 0px 30px;">
              <a href="https://play.google.com/store/apps/details?id=com.megathilendeavours.megathil" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/a2f48557-78b8-48f5-99d6-0a17d35d10a9.png" alt="Google Play" style="margin-right: 10px;" />
              </a>
              <a href="https://apps.apple.com/app/megathil/id6636491765" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/cededcd8-8bfc-4ba9-a5b2-170f55a3b4e2.png" alt="App Store" style="margin-right: 10px;" />
              </a>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    userPurchase: (name: string, message: string, gemValue: string, amount: string, currencySymbol: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Megathil Premium Unlock Email</title>
      </head>
      <body style="background-color: #f7f6ff; font-family: 'Poppins', sans-serif; margin: 0; padding: 0; width: 100%;">
        <!-- Header Section -->
        <table
          style="width: 100%; margin: 0 auto; padding: 0; max-width: 600px; background-color: #f7f6ff; border: none;   border-collapse: collapse;">
          <tr style="background: linear-gradient(to left, #5D5CCA, #C975DC);">
            <td style="padding: 30px 0; text-align: left;">
              <a href="https://megathil.com">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/0ca3a104-f3ca-4ead-8b1a-9d9c614ee29c.png" style="display: block; margin-left: 24px; width: auto;"
                  class="logo logo_img" alt="Megathil Logo" />
              </a>
            </td>
          </tr>
        </table>
        <!-- Introductory Section -->
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: rgb(255, 255, 255); padding: 20px;">
          <tr>
            <th style="font-size: 18px; padding-bottom: 15px; text-align: left;">Hi, ${name}!</th>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              ${message}
            </td>
          </tr>
        </table>
        <!-- Premium Features Section -->
        <table
          style="width: 100%; margin: 0 auto; max-width: 600px; border-top: 2px solid #645ECB; background-color: rgb(255, 255, 255); padding: 20px;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Here’s what you’ve unlocked with Premium: No interruptions, just pure focus. Exclusive Lessons – Access special
              lessons and content. Offline Mode – Learn anytime, anywhere, without internet.
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              But wait, there’s more! You’ve also snagged ${gemValue} Gems to supercharge your experience. Use them to:
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Boost Your Streak – Keep your learning streak alive! Unlock Special Features – Take advantage of exclusive
              in-app perks.
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Ready to dive in? Let’s make this learning interview journey unforgettable!
            </td>
          </tr>
        </table>
        <!-- Gems Purchased Section -->
        <table
          style="width: 100%; margin: 0 auto; max-width: 600px; border-bottom: 2px solid #919191; background-color: rgb(255, 255, 255); padding: 20px;">
          <tr>
            <th style="font-size: 16px; padding-bottom: 20px; 
          text-align: start;">Gems Purchased:</th>
          </tr>
          <tr>
            <td style="font-size: 16px; padding-bottom: 10px;">
              <b>
                <li>${gemValue} (PREMIUM_BONUS)</li>
              </b>
            </td>
            <td style="text-align: right; font-size: 16px;"><b>${currencySymbol}${amount}</b></td>
          </tr>
        </table>
        <!-- Total Amount Section -->
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: rgb(255, 255, 255); padding: 20px;">
          <tr>
            <th style="font-size: 16px; padding-bottom: 10px; 
          text-align: start;">Total Amount:</th>
            <th style="text-align: right; font-size: 16px; padding-bottom: 10px;">${currencySymbol}${amount}</th>
          </tr>
        </table>
        <!-- Closing Section -->
        <table
          style="width: 100%; margin: 0 auto; max-width: 600px; background-color: rgb(255, 255, 255); padding:  0px 20px 20px 20px;">
          <tr>
            <td style="font-size: 16px;">
              Thanks for being a part of the Megathil family. If you have any questions, just hit reply, and we’ll be happy to
              help!
            </td>
          </tr>
        </table>
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: rgb(255, 255, 255);">
          <tr>
            <td style="text-align: center; color: #645ecb; font-size: 18px; font-weight: bold; padding: 20px;">
              <b>Happy learning,</b>
            </td>
          </tr>
        </table>
        <table
          style="width: 100%; margin: 0 auto; max-width: 600px; background-color: rgb(255, 255, 255); text-align: right;">
          <tr>
            <td style="font-size: 16px; padding-right: 30px;">Kind regards</td>
          </tr>
          <tr>
            <td style="font-size: 16px; padding-right: 30px; padding-bottom: 20px;">The Megathil Team</td>
          </tr>
        </table>
        <!-- App Download Section -->
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background: linear-gradient(to left, #5D5CCA, #C975DC);">
          <tr>
            <th style="font-size: 16px; font-weight: 600; color: #ffffff; text-align: right; padding: 20px 30px;">Download Our
              App</th>
          </tr>
          <tr>
            <td style="text-align: right; padding: 0px 30px;">
              <a href="https://play.google.com/store/apps/details?id=com.megathilendeavours.megathil" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/a2f48557-78b8-48f5-99d6-0a17d35d10a9.png" alt="Google Play" style="margin-right: 10px;" />
              </a>
              <a href="https://apps.apple.com/app/megathil/id6636491765" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/cededcd8-8bfc-4ba9-a5b2-170f55a3b4e2.png" alt="App Store" style="margin-right: 10px;" />
              </a>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    interviewBooking: (interviewerName: string, message: string, userName: string, date: string, time: string) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Megathil Interview Email</title>
      </head> 
      <body style="background-color: #f7f6ff; font-family: 'Poppins', sans-serif; margin: 0; padding: 0; width: 100%;">
        <!-- Header Section -->
        <table
          style="width: 100%; margin: 0 auto; padding: 0; max-width: 600px; background-color: #f7f6ff; border: none;   border-collapse: collapse;">
          <tr style="background: linear-gradient(to left, #5D5CCA, #C975DC);">
            <td style="padding: 30px 0; text-align: left;">
              <a href="https://megathil.com">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/0ca3a104-f3ca-4ead-8b1a-9d9c614ee29c.png" style="display: block; margin-left: 24px; width: auto;"
                  class="logo logo_img" alt="Megathil Logo" />
              </a>
            </td>
          </tr>
        </table>
        <!-- Introduction Section -->
        <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
          <tr>
            <th style="font-size: 18px; padding-bottom: 15px; text-align: left;">Hi, ${interviewerName}!</th>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">${message}</td>
          </tr>
        </table>
        <!-- Interview Details Section -->
        <table
          style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-top: 2px solid #645ECB; padding:  20px 20px 0px 20px;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 5px;">
              We have scheduled an interview for ${userName} on ${date} at ${time}, and we kindly request your approval to
              confirm the appointment. Here are the details:
            </td>
          </tr>
        </table>
        <!-- User Information Section -->
        <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding:  0px 20px 0px 20px;">
          <tr>
            <td style="font-size: 16px; padding-bottom: 10px;">
              <ul style="list-style-type: none; padding-left: 0;">
                <li style="font-size: 16px; line-height: 24px; padding-bottom: 12px;"><b>User Name:</b> ${userName}</li>
                <li style="font-size: 16px; line-height: 24px; padding-bottom: 12px;"><b>Interview Date:</b> ${date}</li>
                <li style="font-size: 16px; line-height: 24px; padding-bottom: 12px;"><b>Interview Time:</b> ${time}</li>
              </ul>
            </td>
          </tr>
        </table>
        <!-- Additional Information Section -->
        <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0px 20px 20px 20px;">
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Please review the details at your earliest convenience and let us know if any changes are required.
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              Once you approve, we will notify the student and finalize the arrangements.
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
              If you need any additional information, feel free to contact me directly.
            </td>
          </tr>
        </table>
        <!-- Closing Section -->
        <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <tr>
            <td style="text-align: center; color: #645ECB; font-size: 18px; font-weight: bold; padding: 20px 0;">
              <b>Thank you for your time and cooperation.</b>
            </td>
          </tr>
        </table>
        <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; text-align: right;">
          <tr>
            <td style="font-size: 16px; padding-right: 30px;">Kind regards</td>
          </tr>
          <tr>
            <td style="font-size: 16px; padding-right: 30px; padding-bottom: 20px;">The Megathil Team</td>
          </tr>
        </table>
        <!-- App Download Section -->
        <table style="width: 100%; margin: 0 auto; max-width: 600px; background: linear-gradient(to left, #5D5CCA, #C975DC);">
          <tr>
            <th style="font-size: 16px; font-weight: 600; color: #ffffff; text-align: right; padding: 20px 30px;">Download Our
              App</th>
          </tr>
          <tr>
            <td style="text-align: right; padding: 0px 30px;">
              <a href="https://play.google.com/store/apps/details?id=com.megathilendeavours.megathil" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/a2f48557-78b8-48f5-99d6-0a17d35d10a9.png" alt="Google Play" style="margin-right: 10px;" />
              </a>
              <a href="https://apps.apple.com/app/megathil/id6636491765" target="_blank">
                <img src="${process.env.IMAGE_URL}/fileUpload/read/cededcd8-8bfc-4ba9-a5b2-170f55a3b4e2.png" alt="App Store" style="margin-right: 10px;" />
              </a>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    interviewResult: (name: string, message: string, score: string, strength: string, improvement: string, technical:
        string, behavioural: string, communication: string, resourceLink: string) => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Megathil Interview Feedback Email</title>
        </head>
        <body style="background-color: #f7f6ff; margin: 0; padding: 0;">
          <table
            style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #f7f6ff; border: none; border-collapse: collapse;">
            <tr style="background: linear-gradient(to left, #5D5CCA, #C975DC);">
              <td style="padding: 30px 0; text-align: left;">
                <a href="https://megathil.com">
                  <img src="${process.env.IMAGE_URL}/fileUpload/read/0ca3a104-f3ca-4ead-8b1a-9d9c614ee29c.png" style="display: block; margin-left: 24px; width: auto;"
                    class="logo logo_img" alt="Megathil Logo" />
                </a>
              </td>
            </tr>
          </table>
          <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <tr>
              <th style="font-size: 20px; padding-bottom: 15px; text-align: left;">Hi, ${name}!</th>
            </tr>
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                Thank you for completing your interview with us at Megathil! We're excited to share your feedback and results to
                help you improve and ace your future interviews.
                ${message}
              </td>
            </tr>
          </table>
          <table
            style="width: 100%; max-width: 600px; margin: 0 auto; border-top: 2px solid #645ECB; background-color: #ffffff; padding: 20px;">
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                <b>Here’s a summary of your performance:</b> Overall Score: ${score}
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                <b>Strengths:</b> ${strength}
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                <b>Areas for Improvement:</b> ${improvement}
              </td>
            </tr>
          </table>
          <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <tr>
              <th style="font-size: 20px; padding-bottom: 15px; text-align: left;">Detailed Feedback:</th>
            </tr>
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                <li style="padding-left: 20px;">Technical Skills: ${technical}</li>
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                <li style="padding-left: 20px;">Behavioural Responses: ${behavioural}</li>
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                <li style="padding-left: 20px;">Communication: ${communication}</li>
              </td>
            </tr>
          </table>
          <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                We recommend focusing on the following: Practice ${improvement} to strengthen your responses. Review
                ${resourceLink} for a deeper understanding of key concepts.
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                [Schedule Another Mock Interview] to keep honing your skills and get even better for your real interviews!
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                If you have any questions or need further guidance, don’t hesitate to reach out. We’re here to help you succeed!
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                <b>Tip:</b> Keep practicing mock interviews to build confidence!
              </td>
            </tr>
          </table>
          <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="font-size: 18px; text-align: center; color: #645ecb; padding: 20px;">
                <b>Thank you!</b>
              </td>
            </tr>
          </table>
          <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; text-align: right;">
            <tr>
              <td style="font-size: 16px; padding-right: 30px;">Kind regards</td>
            </tr>
            <tr>
              <td style="font-size: 16px; padding-right: 30px; padding-bottom: 20px;">The Megathil Team</td>
            </tr>
          </table>
          <table style="width: 100%; margin: 0 auto; max-width: 600px; background: linear-gradient(to left, #5D5CCA, #C975DC);">
            <tr>
              <th style="font-size: 16px; font-weight: 600; color: #ffffff; text-align: right; padding: 20px 30px;">Download Our
                App</th>
            </tr>
            <tr>
              <td style="text-align: right; padding: 0px 30px;">
                <a href="https://play.google.com/store/apps/details?id=com.megathilendeavours.megathil" target="_blank">
                  <img src="${process.env.IMAGE_URL}/fileUpload/read/a2f48557-78b8-48f5-99d6-0a17d35d10a9.png" alt="Google Play" style="margin-right: 10px;" />
                </a>
                <a href="https://apps.apple.com/app/megathil/id6636491765" target="_blank">
                  <img src="${process.env.IMAGE_URL}/fileUpload/read/cededcd8-8bfc-4ba9-a5b2-170f55a3b4e2.png" alt="Google Play" style="margin-right: 10px;" />
                </a>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `,
    userloginOtp: (otp: string) => `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Email OTP Template</title>
          </head>
          <body style="background-color: #f7f6ff; font-family: 'Poppins', sans-serif; margin: 0; padding: 0; width: 100%;">
            <!-- Header Section -->
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background: linear-gradient(to left, #5D5CCA, #C975DC);">
              <tr>
                <td style="padding: 20px; text-align: left;">
                  <a href="https://megathil.com">
                    <img src="${process.env.IMAGE_URL}/fileUpload/read/0ca3a104-f3ca-4ead-8b1a-9d9c614ee29c.png" style="width: auto; display: block;" alt="Megathil Logo">
                  </a>
                </td>
              </tr>
            </table>
            <!-- Main Content with Inner Card -->
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 20px 20px 80px 20px;">
              <!-- Inner Card with Border-Top -->
              <tr>
                <td style="border-top: 5px solid #5D5CCA; padding: 20px; background-color: #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 8px;">
                  <table width="100%">
                    <tr>
                      <td style="font-size: 16px; color: #333333; padding-bottom: 10px;">
                        <strong>Hello,</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 16px; color: #858383; font-weight: 500; line-height:24px;">
                        Welcome to Megathil, where careers are transformed! Before you can fully access our cutting-edge platform, we need to verify your email for security purposes.
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center; font-size: 18px; color: #000000; padding: 20px 0;">
                        <strong>OTP</strong>
                      </td>
                    </tr>
                    <!-- OTP Box -->
                    <tr>
                      <td style="text-align: center;">
                        <div style="display: inline-block; background-color: #f3f3f3; padding: 10px 50px; border-radius: 5px; font-size: 28px; letter-spacing: 4px; font-weight: bold; color: #000000;">
                          ${otp}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #555555; text-align: center; line-height: 24px;  padding:20px 0px 0px 0px;">
                        Please enter this code in the app. For your security, it will expire in <strong>10 </strong>minutes.
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #5D5CCA; text-align: center; padding: 20px 0px; line-height: 24px; font-weight: 600;">
                        Thank you for choosing Megathil. <br>We’re here to help you land your dream job with confidence!
                      </td>
                    </tr>
                    <table style="width: 100%; margin: 0 auto; max-width: 600px; background-color: rgb(255, 255, 255); text-align: right;">
                      <tr>
                        <td style="font-size: 15px; ">Regards,</td>
                      </tr>
                      <tr>
                        <td style="font-size: 15px;  padding-bottom: 20px;">The Megathil Team</td>
                      </tr>
                    </table>
          					</table>
                </td>
              </tr>
            </table>
            <!-- Closing Message -->
            <!-- Footer Section -->
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background: linear-gradient(to left, #5D5CCA, #C975DC); text-align: center;">
              <tr>
                <td style="padding: 20px;">
                  <span style="color: #ffffff; font-size: 16px; font-weight: 600;">Download Our App</span>
                  <div style="padding-top: 10px;">
                    <a href="https://play.google.com/store/apps/details?id=com.megathilendeavours.megathil" target="_blank">
                      <img src="${process.env.IMAGE_URL}/fileUpload/read/a2f48557-78b8-48f5-99d6-0a17d35d10a9.png" alt="Google Play" style="margin-right: 10px;">
                    </a>
                    <a href="https://apps.apple.com/app/megathil/id6636491765" target="_blank">
                      <img src="${process.env.IMAGE_URL}/fileUpload/read/cededcd8-8bfc-4ba9-a5b2-170f55a3b4e2.png" alt="App Store">
                    </a>
                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
        `,
    promotor: (name: string, password: string, email: string, loginLink: string, promoCode: string, googleURL: string, appStoreURL: string) => `
        <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Promotor Login Details</title>
          </head>
          <body style="background-color: #f7f6ff; margin: 0; padding: 0;">
            <table
              style="width: 100%; margin: 0 auto; max-width: 600px; background-color: #f7f6ff; border: none; border-collapse: collapse;">
              <tr style="background: linear-gradient(to left, #5D5CCA, #C975DC);">
                <td style="padding: 30px 0; text-align: left;">
                  <a href="https://megathil.com">
                    <img src="${process.env.IMAGE_URL}/fileUpload/read/0ca3a104-f3ca-4ead-8b1a-9d9c614ee29c.png" style="display: block; margin-left: 24px; width: auto;"
                      class="logo logo_img" alt="Megathil Logo" />
                  </a>
                </td>
              </tr>
            </table>
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
              <tr>
                <th style="font-size: 20px; padding-bottom: 15px; text-align: left;">Hi, ${name}!</th>
              </tr>
              <tr>
                <td style="font-size: 16px; line-height: 24px; color: #737373; padding-bottom: 15px;">
                  Thank you for partnering with us to promote <b style="color: #000000;"> Megathil, the No.1 AI-driven career accelerator! </b> We’re excited to
                  have you onboard. To make it easy for you to start sharing, we’ve created a unique <b style="color: #000000;"> link </b> and <b style="color: #000000;"> promo code </b> just for
                  you.
                </td>
              </tr>
            </table>
            <table
              style="width: 100%; max-width: 600px; margin: 0 auto; border-top: 2px solid #645ECB; background-color: #ffffff; padding: 20px;">
              <tr>
                <td style="font-size: 16px; line-height: 24px; padding-bottom:8px;">
                  <b> Here’s what you need to get started: </b>
                </td>
              </tr>
              <tr>
                <td style="font-size: 16px; line-height: 24px; padding-bottom: 8px;">
                  <ol style="padding: 0px 0px 0px 26px;"><b> 1.Your Unique Play Store Link: </b></ol>
                </td>
              </tr>
              <tr>
                <td style="text-align: center;">
                  <div style="    display: inline-block;
                    background-color: #F3F3F3;
                    padding: 18px 14px;
                    border-radius: 5px;
                    font-weight: 500;
                    font-size: 14px;
                    color: #000000;">
                    <p><a href="${googleURL}" target="_blank" style="color: #007bff; text-decoration: none;">${googleURL}</a></p> 
                  </div>
                </td>
              </tr>
              <tr>
                <td style="font-size: 16px; line-height: 24px; padding-bottom: 8px;">
                  <ol style="padding: 0px 0px 0px 26px;"><b> 2.Your Unique App Store Link: </b></ol>
                </td>
              </tr>
              <tr>
                <td style="text-align: center;">
                  <div style="    display: inline-block;
                    background-color: #F3F3F3;
                    padding: 18px 14px;
                    border-radius: 5px;
                    font-weight: 500;
                    font-size: 14px;
                    color: #000000;">
                    <p><a href="${appStoreURL}" target="_blank" style="color: #007bff; text-decoration: none;">${appStoreURL}</a></p> 
                  </div>
                </td>
              </tr>
              <tr>
                <td style="font-size: 14px; text-align: center; color: #000000; padding: 20px;">
                  Use this link to guide your audience directly to our app. We’ll track sign-ups from your link to keep you
                  updated on your impact!
                </td>
              </tr>
              <tr>
                <td style="font-size: 16px; line-height: 24px; padding-bottom: 8px;">
                  <ol style="padding: 0px 0px 0px 26px;"><b> 3.Promo Code: </b></ol>
                </td>
              </tr>
              <tr>
                <td style="text-align: center;">
                  <div style="display: inline-block;
                    background-color: #F3F3F3;
                    padding: 18px 100px;
                    border-radius: 5px;
                    font-weight: 900;
                    font-size: 14px;
                    color: #000000;">
                    ${promoCode} </div>
                </td>
              </tr>
              <tr>
                <td style="font-size: 14px; text-align: center; color: #000000; padding: 20px;">
                  Share this code with your audience to help them unlock special benefits on Megathil.
                </td>
              </tr>
            </table>
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; ">
              <tbody>
                <tr>
                  <td>
                    <!-- Inner card-style table -->
                    <table style="    width: 100%;
                    background-color: #ffffff;
                    border: 1px solid #ddd;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      <thead>
                        <tr>
                          <th style="font-size: 20px; text-align: left; color: #333; padding-bottom: 10px;">How to Use Your Promo Code Effectively:</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style="font-size: 16px; color: #555; line-height: 2.2;">
                            <ol style="padding-left: 20px; margin: 0;">
                              <li>Download our mobile app from the <a href="https://apps.apple.com/app/megathil/id6636491765" style="color: #007bff; text-decoration: underline;">App Store</a> or <a href="https://play.google.com/store/apps/details?id=com.megathilendeavours.megathil" style="color: #007bff; text-decoration: underline;">Google Play Store</a>.</li>
                              <li>Share your unique link and promo code on your social media platforms or directly with your audience.</li>
                              <li>Encourage your audience to sign up using your link or apply the promo code during the signup process to unlock exclusive perks.</li>
                              <li>Each time someone uses your link or promo code, they will receive the offer you’ve created. You can track all sign-ups and campaign progress via our admin panel.</li>
                            </ol>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size: 16px; color: #555; line-height: 1.6; padding-top: 15px;">
                            <p><strong>Link:</strong> <a href="${loginLink}" style="color: #007bff; text-decoration: none;">${loginLink}</a></p>
                            <p><strong>Email:</strong>${email}</p>
                            <p><strong>Password:</strong>${password}</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <!-- End of inner card-style table -->
                  </td>
                </tr>
              </tbody>
            </table>
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px 20px 20px 20px;">
              <tr>
                <td style="font-size: 16px; line-height: 24px; padding-bottom: 15px;">
                  Let us know if you have any questions or need additional resources to help you promote Megathil effectively.
                </td>
              </tr>
            </table>
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <tr>
                <td style="font-size: 18px; text-align: center; color: #645ecb; padding: 20px;">
                  <b>We can’t wait to see the buzz you’ll create! 🚀</b>
                </td>
              </tr>
            </table>
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; text-align: right;">
              <tr>
                <td style="font-size: 16px; padding-right: 30px;"><b>Regards</b> </td>
              </tr>
              <tr>
                <td style="font-size: 16px; padding-right: 30px; padding-bottom: 20px;">The Megathil Team</td>
              </tr>
            </table>
            <table style="width: 100%; margin: 0 auto; max-width: 600px; background: linear-gradient(to left, #5D5CCA, #C975DC);">
              <tr>
                <th style="font-size: 16px; font-weight: 600; color: #ffffff; text-align: right; padding: 20px 30px;">Download Our
                  App</th>
              </tr>
              <tr>
                <td style="text-align: right; padding: 0px 30px;">
                  <a href="https://play.google.com/store/apps/details?id=com.megathilendeavours.megathil" target="_blank">
                    <img src="${process.env.IMAGE_URL}/fileUpload/read/a2f48557-78b8-48f5-99d6-0a17d35d10a9.png" alt="Google Play" style="margin-right: 10px;" />
                  </a>
                  <a href="https://apps.apple.com/app/megathil/id6636491765" target="_blank">
                    <img src="${process.env.IMAGE_URL}/fileUpload/read/cededcd8-8bfc-4ba9-a5b2-170f55a3b4e2.png" alt="App Store" style="margin-right: 10px;" />
                  </a>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
  };

  async sendMail(
    to: string,
    subject: string,
    userType: string,
    templateData: any
  ): Promise<string> {
    let htmlTemplate: string;

    switch (userType) {
      case 'USER':
        htmlTemplate = this.emailTemplates.user(templateData.name, templateData.message);
        break;
      case 'STAFF':
        htmlTemplate = this.emailTemplates.staff(templateData.name, templateData.message);
        break;
      case 'INTERVIEWER':
        htmlTemplate = this.emailTemplates.interviewer(templateData.name, templateData.message);
        break;
      case 'USERPURCHASE':
        htmlTemplate = this.emailTemplates.userPurchase(templateData.name, templateData.message, templateData.gemValue, templateData.amount, templateData.currencySymbol);
        break;
      case 'INTERVIEWERBOOKING':
          htmlTemplate = this.emailTemplates.interviewBooking(templateData.interviewerName, templateData.message, templateData.userName, templateData.date, templateData.time);
          break;
      case 'INTERVIEWRESULT':
          htmlTemplate = this.emailTemplates.interviewResult(templateData.name, templateData.message, templateData.score, templateData.strength, templateData.improvement, templateData.technical, templateData.behavioural, templateData.communication, templateData.resourceLink);
          break;
      case 'USER_LOGIN':
            htmlTemplate = this.emailTemplates.userloginOtp(templateData.otp);
            break;
      case 'PROMOTOR':
            htmlTemplate = this.emailTemplates.promotor(templateData.name, templateData.password, templateData.email, templateData.loginLink, templateData.promoCode, templateData.googleURL, templateData.appStoreURL);
            break;
      default:
        throw new Error('Invalid user type');
    }

    try {
      this.mailService.sendMail({
        from: process.env.SMTP_USERNAME,
        to,
        subject,
        html: htmlTemplate
      }).then((res) => {
        console.log("Contact received mail sent:", res?.messageId);
      }).catch((e) => {
        console.log("Contact not received mail:", e);
      })
      return htmlTemplate;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
