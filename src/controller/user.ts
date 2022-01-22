import { Controller, Provide, Get, Post, Plugin, Inject } from '@midwayjs/decorator';
import { Context } from 'egg';
import { UserService } from '../service/user';

import { RedisService } from '@midwayjs/redis';
import {generateHash } from '../utils/generate';

@Provide()
@Controller('/api/user')
export class UserController {
  @Inject()
  ctx: Context;

  @Plugin()
  jwt;

  @Inject()
  userService: UserService;

  @Inject()
  redisService: RedisService;

  @Post('/register')
  async register() {
    console.log("register")
    const { username, password, email } = this.ctx.request.body;
    // 检查参数
    if(username && password && email){
      const registerInfo = {
        registerTime: Date.now(),
        status: 0,
        username,
        password: generateHash(password),
        email,
      };
      // 检查账号是否被注册
      const hasUser = await this.userService.find({$or: [{username}, {email}]});
      if(hasUser) {
        this.ctx.body = {
          code: 200,
          msg: "该账号或邮箱已被注册",
        };
        return;
      }
      // 继续注册操作
      const { id } = await this.userService.create(registerInfo);
      // 发送激活邮件
      await this.userService.registerEmail(id, email);
      this.ctx.body = {
        code: 200,
        msg: id ? "注册成功": "注册失败",
        data: { id },
      };
    }else{
      this.ctx.status = 400;
      this.ctx.body = {
        code: 400,
        message: "缺少参数"
      };
    }
  }

  @Get('/registerEmail')
  async registerEmail(){
    const { id , email } = this.ctx.query;
    if(id && email){
      const document = await this.userService.find({_id: id, email});
      if(document){
        if(document.status > 0){
          this.ctx.body = {
            code: 0,
            msg: "邮箱已认证"
          }
          return;
        }
        await this.userService.registerEmail(id, email);
        this.ctx.body = {
          code: 0,
          msg: "邮箱认证成功"
        }
        return;
      }
    };
    this.ctx.status = 400;
    this.ctx.body = {
      msg: "fail",
      code: 400,
    }
  }

  @Get('/confirmEmail')
  async confirmEmail() {
    const { id, code, email } = this.ctx.request.query;
    if(id && code && email) {
      const status = await this.redisService.del("confirmEmail"+ email + code);
      if(status){
        const res = await this.userService.update(id, {status: 1})
        this.ctx.body = {
          code: 0,
          msg: "success",
          res,
        }
      }else {
        this.ctx.body = {
          code: 1,
          msg: "fail",
        }
      }
    }
  }

  @Post('/login')
  async login() {
    // 登录
    const { username, password } = this.ctx.request.body;
    if(username && password){
      const data = await this.userService.find({$or: [{email: username}, {username}]});
      if(data){
        if(data.password !== generateHash(password)){
          this.ctx.body = {
            code: 200,
            msg: "密码错误，请重试",
          }
          return;
        }else{
          this.userService.update(data._id, { loginTime: Date.now() });
          const token = this.jwt.sign({
            uuid: data._id,
            expireTime: Date.now() + 1800000, // 有效期30分钟
          });
          await this.redisService.set("token"+ token, 1, "EX", 30 * 60);
          this.ctx.body = {
            code: 200,
            msg: "登录成功",
            token,
          };

        }
      }else{
        this.ctx.body = {
          code: 200,
          msg: "账号还未注册",
        }
        return;
      }

    }else{
      this.ctx.status = 400;
      this.ctx.body = {
        code: 400,
        message: "缺少参数"
      };
    }
  }

  @Get('/token')
  async token(ctx) {
    // todo: 测试用的token验证
    ctx.body = this.ctx.state.user;
  }

  @Get('/logout')
  async logout() {
    // 退出登录
    const token = this.ctx.header.authorization.replace("Bearer ","");
    const remainSeconds = await this.redisService.ttl("token" + token);
    // 不能立马删除是因为走中间件要过token，让他自然过期就好
    if(remainSeconds > 5){
      await this.redisService.expire("token" + token, 2);
    }
    this.ctx.body = {
      code: 200,
      message: "注销成功",
    };
  }
}
