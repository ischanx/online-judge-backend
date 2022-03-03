import {
  Controller,
  Provide,
  Inject,
  Post,
  ALL,
  Validate,
  Body,
} from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import { Context } from 'egg';
import { ProblemService } from '../service/problem';
import { SubmissionsService } from '../service/submissions';
import {
  getBySubmissionIdDTO,
  SubmissionDTO,
  updateBySubmissionIdDTO,
} from '../model/submission';
import { JudgeManagerService } from '../service/judgeManager';

@Provide()
@Controller('/api/submission')
export class SubmissionController {
  @Inject()
  ctx: Context;

  @Inject()
  redisService: RedisService;

  @Inject()
  problemService: ProblemService;

  @Inject()
  submissionService: SubmissionsService;
  @Inject()
  judgeManagerService: JudgeManagerService;

  @Post('/submit')
  @Validate()
  async submit(@Body(ALL) body: SubmissionDTO) {
    const { lang, code, problemId } = body;
    const response = this.ctx.body;
    const problem = await this.problemService.queryByProblemId(
      String(problemId)
    );
    if (!problem) {
      throw {
        code: 4002,
        message: '题目不存在',
      };
    }
    const obj = {
      problemId,
      code,
      lang,
      problemNumber: problem.number,
      problemTitle: problem.title,
      uid: this.ctx.state.user.uuid,
      username: this.ctx.state.user.name,
      status: 'pending',
    };

    const submitResult = await this.submissionService.submit(obj);
    const submissionId = submitResult._id;
    if (submitResult) {
      await this.judgeManagerService.deliverTask({
        submissionId,
        code,
        lang,
        problemId,
        ...JSON.parse(JSON.stringify(problem)),
      });
      response.data = {
        submissionId,
      };
    } else {
      throw {
        code: 4002,
        message: '提交失败',
      };
    }
  }

  @Post('/check')
  @Validate()
  async check(@Body(ALL) body: getBySubmissionIdDTO) {
    const { id } = body;
    const response = this.ctx.body;
    const res = await this.submissionService.getBySubmissionId(id);
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

  @Post('/update')
  @Validate()
  async update(@Body(ALL) body: updateBySubmissionIdDTO) {
    if (
      this.ctx.header['x-judge-server-token'] !==
      this.ctx.app.config.JUDGE_TOKEN
    ) {
      console.error(
        `收到未知评测机的请求[${this.ctx.header['x-judge-server-token']}]`
      );
      throw {
        code: 4001,
        message: '评测机token不一致',
      };
    }
    const { submissionId, log, result } = body;
    await this.submissionService.updateBySubmissionId(submissionId, {
      result,
      log,
      status: result ? 'success' : 'pending',
    });
  }

  @Post('/list')
  async list() {
    const response = this.ctx.body;
    const res = await this.submissionService.list();
    response.data = res;
  }
}
