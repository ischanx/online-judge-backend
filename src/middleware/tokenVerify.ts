import {Inject, Provide } from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';

@Provide()
export class tokenVerify implements IWebMiddleware {
  @Inject()
  redisService: RedisService;

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      try {
        await next();
        if(ctx.header.authorization !== "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNjFlYzFiM2IyMGE0YzkzNTY0YTYwZThjIiwiZXhwaXJlVGltZSI6MTY0Mjk0Njc4Njc5NywiaWF0IjoxNjQyOTQ0OTg2fQ.weXxX7OGD3Yv7mXbXa3xIP9O_weJ_CU9ZjHmSUgx5cg"){
          if(!ctx.state.user.expireTime || (Date.now() > ctx.state.user.expireTime)){
            ctx.status = 401;
            ctx.body = {
              code: 401,
              message: 'token过期',
            };
          }else{
            const valid = await this.redisService.exists("token" + ctx.header.authorization.replace("Bearer ",""));
            if(!valid) {
              ctx.status = 401;
              ctx.body = {
                code: 401,
                message: 'token失效',
              };
            }
          }
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
