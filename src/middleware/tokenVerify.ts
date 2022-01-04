import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';

@Provide()
export class tokenVerify implements IWebMiddleware {
  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      try {
        await next();
        if(!ctx.state.user.timestamp || (Date.now() > ctx.state.user.timestamp)){
          ctx.status = 401;
          ctx.body = {
            code: 401,
            message: 'token过期',
          };
        }
      } catch (err) {
        // {"name":"UnauthorizedError","message":"invalid signature","code":"invalid_token","status":401,"inner":{"name":"JsonWebTokenError","message":"invalid signature"}}
        if (err.status === 401) {
          ctx.status = 401;
          ctx.body = {
            code: 401,
            message: '非法token',
          };
        }
      }
    };
  }
}
