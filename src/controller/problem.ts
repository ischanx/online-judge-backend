import { Controller, Provide, Get, Inject, Post} from '@midwayjs/decorator';
import { Context } from 'egg';
import { ProblemService } from '../service/problem'

@Provide()
@Controller('/api/problem')
export class ProblemController {
  @Inject()
  ctx: Context;

  @Inject()
  problemService: ProblemService;

  @Post('/add')
  async add() {
    try{
      this.ctx.body = await this.problemService.create(this.ctx.request.body);
    }catch (e){
      console.log(e)
    }
  }

  @Get('/get')
  async get() {
    const obj = {
      id: this.ctx.request.query.id,
    }
    this.ctx.body = await this.problemService.find(obj);
  }
}
