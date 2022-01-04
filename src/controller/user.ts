import { Controller, Provide, Get, Post, Plugin, Inject} from '@midwayjs/decorator';
import { Context } from 'egg';
@Provide()
@Controller('/api/user')
export class UserController {
  @Inject()
  ctx: Context;

  @Plugin()
  jwt;

  @Post('/login')
  async login(ctx) {
    // 登录
    const { username, password } = ctx.request.body;
    if(username && password){
      const loginSuccess = password === "123456";
      ctx.body = {
        code: 200,
        message: loginSuccess ? "登录成功": "登陆失败",
        token: loginSuccess ? this.jwt.sign({
          user: username,
          timestamp: Date.now() + 1800000, // 有效期30分钟
        }) : "",
      };
    }else{
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "缺少参数"
      };
    }
  }

  @Get('/logout')
  async logout(ctx) {
    // 退出登录
    ctx.body = {
      code: 200,
      message: "退出成功",
    };
  }

  @Get('/token')
  async token(ctx) {
    // token验证
    ctx.body = this.ctx.state.user;
  }
}
