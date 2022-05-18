import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { UserModel } from '../model/user';
import { generateHash, generateString } from '../utils/generate';
import { MailService } from './mail';
import { RedisService } from '@midwayjs/redis';

@Provide()
export class UserService {
  @InjectEntityModel(UserModel)
  userModel: ReturnModelType<typeof UserModel>;

  @Inject()
  mailService: MailService;

  @Inject()
  redisService: RedisService;

  async create(user) {
    const { _id: id } = await this.userModel.create(user);
    return { id };
  }

  async update(id, user) {
    const res = await this.userModel.updateOne({ _id: id }, user);
    return res;
  }

  async find(filter) {
    return await this.userModel.findOne(filter);
  }

  async registerEmail(id, email) {
    if (id && email) {
      const code = generateString(6);
      await this.redisService.set(
        'confirmEmail' + email + code,
        code,
        'EX',
        300
      );
      // 把code发到指定邮箱
      this.mailService.send({
        to: email,
        subject: '请激活账号',
        html: `<a href="http://127.0.0.1:7001/api/user/confirmEmail?id=${id}&email=${email}&code=${code}"><h1>${code}</h1></a>`,
      });
    }
  }

  async sendCode(email) {
    const code = generateString(6);
    await this.redisService.set('confirmEmail' + email + code, code, 'EX', 300);
    // 把code发到指定邮箱
    this.mailService.send({
      to: email,
      subject: '你的验证码到了！有效期五分钟',
      html: `<h1>${code}</h1>`,
    });
  }

  async listAll() {
    return this.userModel.find({}, { _id: 0, __v: 0 });
  }

  async deleteUser(email: string) {
    return this.userModel.deleteOne({ email });
  }

  async collectSubmitByUid(uid: string) {
    await this.userModel.findOneAndUpdate(
      { _id: uid },
      { $inc: { totalSubmit: 1 } },
      {
        upsert: true,
        new: false,
      }
    );
  }

  async collectSubmitResultByUid(uid: string, success: boolean) {
    const obj: any = {};
    if (success) {
      obj.errorSubmit = 1;
    } else obj.successSubmit = 1;
    await this.userModel.findOneAndUpdate(
      { _id: uid },
      { $inc: obj },
      {
        upsert: true,
        new: false,
      }
    );
  }

  async getUserRank() {
    return this.userModel.find().sort({ totalSubmit: -1, successSubmit: -1 });
  }

  async resetPasswordByEmail(email: string) {
    const password = generateString(6);
    // 把code发到指定邮箱
    await this.mailService.send({
      to: email,
      subject: '密码已被重置',
      html: '新的密码是' + password,
    });
    return this.userModel.findOneAndUpdate(
      { email },
      { password: generateHash(password) }
    );
  }
}
