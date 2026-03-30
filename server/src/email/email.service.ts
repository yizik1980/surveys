import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendSurveyInvitation(
    to: string,
    name: string,
    surveyTitle: string,
    link: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head><meta charset="UTF-8" /></head>
      <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; padding:30px;">
          <h1 style="color:#4f46e5; text-align:center;">מערכת סקרים</h1>
          <h2>שלום ${name},</h2>
          <p>הוזמנת למלא את הסקר: <strong>${surveyTitle}</strong></p>
          <p>לחץ על הכפתור למילוי הסקר:</p>
          <div style="text-align:center; margin:30px 0;">
            <a href="${link}"
               style="background:#4f46e5; color:white; padding:14px 28px; border-radius:8px;
                      text-decoration:none; font-size:16px; font-weight:bold;">
              מלא את הסקר
            </a>
          </div>
          <p style="color:#888; font-size:12px;">
            אם הכפתור לא עובד, העתק את הקישור: ${link}
          </p>
          <hr />
          <p style="color:#aaa; font-size:11px; text-align:center;">מערכת ניהול סקרים</p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@surveys.com',
        to,
        subject: `הוזמנת למלא סקר: ${surveyTitle}`,
        html,
      });
      this.logger.log(`Survey invitation sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
      // Don't throw - email failure shouldn't block the flow
    }
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head><meta charset="UTF-8" /></head>
      <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; padding:30px;">
          <h1 style="color:#4f46e5; text-align:center;">ברוך הבא למערכת הסקרים!</h1>
          <h2>שלום ${name},</h2>
          <p>הרשמתך הושלמה בהצלחה.</p>
          <p>כעת תוכל להתחבר למערכת ולהתחיל להשתמש בה.</p>
          <hr />
          <p style="color:#aaa; font-size:11px; text-align:center;">מערכת ניהול סקרים</p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@surveys.com',
        to,
        subject: 'ברוך הבא למערכת הסקרים',
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}: ${err.message}`);
    }
  }
}
