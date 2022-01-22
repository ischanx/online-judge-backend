const nodemailer = require('nodemailer');
import { Provide } from '@midwayjs/decorator';
const serverOptions = {
  // pool: true,
  host: "smtp.qiye.aliyun.com",
  port: 465,
  secure: true, // use TLS
  auth: {
    user: 'onlinejudge@chanx.tech', // 账号
    pass: '!onlinejudge123', // 授权码,
  },
};
@Provide()
export class MailService {
  async send(options){
    const transporter = nodemailer.createTransport(serverOptions);
    const mailOptions = {
      from: 'onlinejudge@chanx.tech',
      ...options,
    };
    return new Promise((resolve,reject) => {
      // 调用函数，发送邮件
      transporter.sendMail(mailOptions, function(err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    })
  }
};
