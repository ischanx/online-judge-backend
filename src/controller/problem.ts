import {
  Controller,
  Provide,
  Get,
  Inject,
  Post,
  Body,
  ALL,
  Query,
} from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import { Validate } from '@midwayjs/decorator';
import { Context } from 'egg';
import { ProblemService } from '../service/problem';
import {
  ProblemDTO,
  DeleteDTO,
  UpdateDTO,
  QueryByProblemIdDTO,
} from '../model/problem';

@Provide()
@Controller('/api/problem')
export class ProblemController {
  @Inject()
  ctx: Context;

  @Inject()
  redisService: RedisService;

  @Inject()
  problemService: ProblemService;

  @Get('/list')
  async list() {
    const response = this.ctx.body;
    const list = await this.problemService.queryAll();
    response.data = {
      count: list.length,
      list,
    };
  }

  @Get('/getById')
  @Validate()
  async getByID(@Query(ALL) query: QueryByProblemIdDTO) {
    const { id } = query;
    const response = this.ctx.body;
    const res = await this.problemService.queryByProblemId(id);
    if (res) {
      response.data = res;
    } else {
      throw {
        code: 4002,
        message: '题目不存在',
      };
    }
  }

  @Post('/add')
  @Validate()
  async add(@Body(ALL) body: ProblemDTO) {
    // 新添加的题目数据
    const newProblem = body;
    const isDone: any = await this.redisService.get(newProblem.samplesFile);
    if (!isDone)
      throw {
        code: 4003,
        message: 'md5未计算完',
      };
    const res = await this.problemService.add(newProblem);
    const response = this.ctx.body;
    if (res.id) {
      response.data = {
        id: res.id,
      };
    } else {
      throw {
        code: 5001,
        message: '添加题目失败',
      };
    }
  }

  @Post('/update')
  @Validate()
  async update(@Body(ALL) body: UpdateDTO) {
    const { id, data } = body;
    const res = await this.problemService.updateByProblemId(id, data);
    if (res.nModified === 0) {
      throw {
        code: 5001,
        message: '更新题目失败',
      };
    }
  }

  @Post('/delete')
  @Validate()
  async delete(@Body(ALL) body: DeleteDTO) {
    const { id } = body;
    const res = await this.problemService.deleteByProblemId(id);
    if (res === null) {
      throw {
        code: 4002,
        message: '题目不存在',
      };
    }
  }
}
