import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { UserModel } from '../model/user';
import { generateString } from '../utils/generate';
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

  async create(user){
    const { _id: id } = await this.userModel.create(user);
    return { id };
  }

  async update(id, user){
    const res = await this.userModel.updateOne({_id: id}, user);
    return res;
  }

  async find(filter){
    return await this.userModel.findOne(filter);
  }

  async registerEmail(id, email) {
    if(id && email) {
      const code = generateString(6);
      await this.redisService.set("confirmEmail"+ email + code, code,"EX", 300);
      // 把code发到指定邮箱
      this.mailService.send({
        to: email,
        subject: "请激活账号",
        html: `<a href="http://127.0.0.1:7001/api/user/confirmEmail?id=${id}&email=${email}&code=${code}"><h1>${code}</h1></a>`
      })
    }
  }
}
