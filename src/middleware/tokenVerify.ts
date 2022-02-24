import { Inject, Provide } from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';
// eslint-disable-next-line node/no-extraneous-import,node/no-extraneous-require
const UnauthorizedError = require('koa-jwt2/lib/errors/UnauthorizedError');

@Provide()
export class tokenVerify implements IWebMiddleware {
  @Inject()
  redisService: RedisService;

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      try {
        await next();
        if (
          ctx.header.authorization !==
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNjFmMDFhMjhiZTE1NDY1MTE2NTI5ODVjIiwiZXhwaXJlVGltZSI6MTY0MzI5OTM3MTU4MCwiaWF0IjoxNjQzMjk3NTcxfQ.6wezUvaVV6HDvwiJsS8QSReABjjaAlY2Eszi6TwNtdM'
        ) {
          if (
            !ctx.state.user.expireTime ||
            Date.now() > ctx.state.user.expireTime
          ) {
            ctx.status = 401;
            ctx.body = {
              code: 401,
              message: 'token过期',
            };
          } else {
            const valid = await this.redisService.exists(
              'token' + ctx.header.authorization.replace('Bearer ', '')
            );
            if (!valid) {
              ctx.status = 401;
              ctx.body = {
                code: 401,
                message: 'token失效',
              };
            }
          }
        }
      } catch (err) {
        // egg-jwt\app\extend\application.js
        // {"name":"UnauthorizedError","message":"invalid signature","code":"invalid_token","status":401,"inner":{"name":"JsonWebTokenError","message":"invalid signature"}}
        if (err instanceof UnauthorizedError || err?.status === 401) {
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
