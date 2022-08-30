const nodemailer = require('nodemailer');
import { Config, Provide } from '@midwayjs/decorator';

@Provide()
export class MailService {
  @Config('MAIL_OPTIONS')
  mailOptions: any;

  async send(options) {
    const transporter = nodemailer.createTransport(this.mailOptions);
    const mailOptions = {
      from: this.mailOptions.auth.user || 'Online Judge',
      ...options,
    };
    return new Promise((resolve, reject) => {
      // 调用函数，发送邮件
      transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }
}
