import {
  Controller,
  Provide,
  Inject,
  Post,
  ALL,
  Validate,
  Body,
  Get,
  Query,
} from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import { Context } from 'egg';
import { ContestDTO, GetContestProblemDTO } from '../model/contest/contest';
import { ContestService } from '../service/contest';
import { ProblemService } from '../service/problem';
import { ContestRankService } from '../service/rank';
import { ContestSubmissionsService } from '../service/contestSubmissions';

@Provide()
@Controller('/api/contest')
export class ContestController {
  @Inject()
  ctx: Context;

  @Inject()
  redisService: RedisService;

  @Inject()
  contestService: ContestService;

  @Inject()
  problemService: ProblemService;

  @Inject()
  contestRankService: ContestRankService;

  @Inject()
  contestSubmissionService: ContestSubmissionsService;

  @Get('/listAll')
  async listAll() {
    const response = this.ctx.body;
    const res = await this.contestService.listAll();
    response.data = res;
  }

  @Get('/listOne')
  async listOne() {
    const response = this.ctx.body;
    const res = await this.contestService.listOne(
      Number(this.ctx.request.query.id)
    );
    response.data = res;
  }

  @Post('/add')
  @Validate()
  async add(@Body(ALL) body: ContestDTO) {
    const response = this.ctx.body;
    const res = await this.contestService.add(body);
    if (res.id) {
      response.data = {
        id: res.id,
      };
    } else {
      throw {
        code: 5001,
        message: '添加比赛失败',
      };
    }
  }

  @Post('/update')
  async update() {}

  @Post('/delete')
  async delete() {}

  @Get('/getContestProblem')
  @Validate()
  async getContestProblem(@Query(ALL) query: GetContestProblemDTO) {
    const response = this.ctx.body;
    const { contestId, problemNumber } = query;
    const contest = await this.contestService.listOne(contestId);
    const problemCount = contest.problemList.length;
    if (problemNumber > problemCount || problemNumber <= 0) {
      throw {
        code: 4001,
        message: '参数不正确',
      };
    }
    const problem = await this.problemService.queryByProblemId(
      contest.problemList[problemNumber - 1].id
    );
    problem.title = contest.problemList[problemNumber - 1].title;
    response.data = problem;
  }

  @Get('/rank')
  async rank(@Query(ALL) query) {
    const response = this.ctx.body;
    const res = await this.contestRankService.listByContestId(query.id);
    response.data = res;
  }

  @Get('/check')
  @Validate()
  async check() {
    const { id } = this.ctx.query;
    const response = this.ctx.body;
    const res = await this.contestSubmissionService.getBySubmissionId(id);
    if (res) {
      if (!res.result) response.data = { status: 'pending' };
      else response.data = res;
    } else {
      throw {
        code: 4002,
        message: '提交记录不存在',
      };
    }
  }

  @Post('/listUserSubmission')
  async listUserSubmission() {
    const response = this.ctx.body;
    const res =
      await this.contestSubmissionService.listUserSubmissionByProblemId({
        userId: this.ctx.state.user.uuid,
        problemId: this.ctx.request.body.problemId,
        contestId: this.ctx.request.body.contestId,
      });
    response.data = res;
  }
}
