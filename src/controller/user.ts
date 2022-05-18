import {
  Controller,
  Provide,
  Get,
  Post,
  Plugin,
  Inject,
} from '@midwayjs/decorator';
import { Context } from 'egg';
import { UserService } from '../service/user';

import { RedisService } from '@midwayjs/redis';
import { generateHash, getCurrentTimestamp } from '../utils/generate';

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
    const response = this.ctx.body;
    const { username, password, email, code } = this.ctx.request.body;
    // 检查参数
    if (username && password && email && code) {
      // 检查账号是否被注册
      const hasUser = await this.userService.find({
        $or: [{ username }, { email }],
      });
      if (hasUser) {
        throw {
          code: 4002,
          message: '该邮箱已被注册',
        };
      }
      // 检查验证码是否正确
      const hasCode = await this.redisService.del(
        'confirmEmail' + email + code
      );
      if (!hasCode)
        throw {
          code: 4002,
          message: '验证码错误',
        };
      const registerInfo = {
        registerTime: getCurrentTimestamp(),
        status: 1,
        username,
        password: generateHash(password),
        email,
      };

      // 继续注册操作
      const { id } = await this.userService.create(registerInfo);
      // 发送激活邮件
      // 目前注册已需要验证码
      // await this.userService.registerEmail(id, email);
      if (id) {
        response.data = { id, message: '注册成功' };
      } else {
        throw {
          code: 4002,
          message: '注册失败',
        };
      }
    } else {
      throw {
        code: 4001,
        message: '缺少参数',
      };
    }
  }

  @Get('/registerEmail')
  async registerEmail() {
    const { id, email } = this.ctx.query;
    const response = this.ctx.body;
    if (id && email) {
      const document = await this.userService.find({ _id: id, email });
      if (document) {
        if (document.status > 0) {
          throw {
            code: 4003,
            message: '邮箱已认证',
          };
          return;
        }
        await this.userService.registerEmail(id, email);
        response.data = {
          message: '邮箱激活成功',
        };
        return;
      }
    }
    throw {
      code: 4001,
      message: 'fail',
    };
  }

  @Post('/sendCode')
  async sendCodeByEmail() {
    const { email } = this.ctx.request.body;
    console.log(email);
    const response = this.ctx.body;
    if (email) {
      const document = await this.userService.find({ email });
      if (document) {
        if (document.status > 0) {
          throw {
            code: 4003,
            message: '邮箱已注册，请更换邮箱重试',
          };
        }
      } else {
        await this.userService.sendCode(email);
        response.data = {
          message: '成功发送验证码',
        };
      }
    } else {
      throw {
        code: 4001,
        message: 'fail',
      };
    }
  }

  @Get('/confirmEmail')
  async confirmEmail() {
    const { id, code, email } = this.ctx.request.query;
    const response = this.ctx.body;
    if (id && code && email) {
      const status = await this.redisService.del('confirmEmail' + email + code);
      if (status) {
        const res = await this.userService.update(id, { status: 1 });
        response.data = {
          res,
        };
      } else {
        throw {
          code: 4002,
          message: '验证码错误或过期',
        };
      }
    }
  }

  @Post('/login')
  async login() {
    // 登录
    const response = this.ctx.body;
    const { username, password } = this.ctx.request.body;
    if (username && password) {
      const data: any = await this.userService.find({
        $or: [{ email: username }, { username }],
      });
      if (data) {
        if (data.password !== generateHash(password)) {
          throw {
            code: 4002,
            message: '密码错误，请重试',
          };
          return;
        } else {
          this.userService.update(data._id, {
            loginTime: getCurrentTimestamp(),
          });
          const token = this.jwt.sign({
            uuid: data._id,
            username: data.username,
            email: data.email,
            role: data.role || 0,
            expireTime: getCurrentTimestamp() + 24 * 60 * 60 * 1000, // 有效期1天
          });
          await this.redisService.set('token' + token, 1, 'EX', 24 * 60 * 60);
          response.data = {
            token,
            role: data.role || 0,
            username: data.username,
            email: data.email,
            uid: data._id,
            message: '登录成功',
          };
          console.log(data.role);
        }
      } else {
        throw {
          code: 4002,
          message: '账号还未注册',
        };
        return;
      }
    } else {
      throw {
        code: 4002,
        message: '缺少参数',
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
    const response = this.ctx.body;
    const token = this.ctx.header.authorization.replace('Bearer ', '');
    const remainSeconds = await this.redisService.ttl('token' + token);
    // 不能立马删除是因为走中间件要过token，让他自然过期就好
    if (remainSeconds > 5) {
      await this.redisService.expire('token' + token, 2);
    }
    response.data = {
      message: '注销成功',
    };
  }

  @Get('/list')
  async getUser() {
    const response = this.ctx.response.body;
    const res = await this.userService.listAll();
    response.data = {
      list: res,
    };
  }

  @Post('/delete')
  async deleteUser() {
    const response = this.ctx.response.body;
    const email = this.ctx.request.body.email;
    const res = await this.userService.deleteUser(email);
    if (res.deletedCount) {
      response.data = {
        message: `删除用户[${email}]成功`,
      };
    } else {
      throw {
        code: 4003,
        message: `删除用户[${email}]失败`,
      };
    }
  }
}
