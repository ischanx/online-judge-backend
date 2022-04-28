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
import { ContestSubmissionsService } from '../service/contestSubmissions';
import { ContestService } from '../service/contest';

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
  contestService: ContestService;

  @Inject()
  contestSubmissionService: ContestSubmissionsService;

  @Inject()
  judgeManagerService: JudgeManagerService;

  @Post('/submit')
  @Validate()
  async submit(@Body(ALL) body: SubmissionDTO) {
    const { lang, code, problemId, contestId, problemNumber } = body;
    const response = this.ctx.body;
    const problem = await this.problemService.queryByProblemId(problemId);
    if (!problem) {
      throw {
        code: 4002,
        message: '题目不存在',
      };
    }
    const obj = {
      contestId,
      problemNumber,
      problemId,
      code,
      lang,
      problemTitle: problem.title,
      uid: this.ctx.state.user.uuid,
      username: this.ctx.state.user.username,
      status: 'pending',
    };
    let submitResult = null;
    if (obj.contestId && obj.problemNumber) {
      const contest = await this.contestService.listOne(contestId);
      obj.problemId = contest.problemList[problemNumber - 1].id;
      submitResult = await this.contestSubmissionService.submit(obj);
    } else submitResult = await this.submissionService.submit(obj);

    const submissionId = submitResult._id;
    if (submitResult) {
      await this.judgeManagerService.deliverTask({
        submissionId,
        code,
        lang,
        problemId: obj.problemId,
        contestId,
        problemNumber,
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
    const { submissionId, log, result, contestId, problemNumber } = body;
    if (contestId && problemNumber) {
      await this.contestSubmissionService.updateBySubmissionId(submissionId, {
        result,
        log,
        status: result ? 'success' : 'pending',
        contestId,
        problemNumber,
      });
    } else {
      const submit = await this.submissionService.updateBySubmissionId(
        submissionId,
        {
          result,
          log,
          status: result ? 'success' : 'pending',
        }
      );
      this.problemService.collectByProblemId(submit.problemId, result);
    }
  }

  @Post('/list')
  async list() {
    const response = this.ctx.body;
    const res = await this.submissionService.list();
    response.data = res;
  }

  @Post('/listUserSubmission')
  async listUserSubmission() {
    const response = this.ctx.body;
    const res = await this.submissionService.listUserSubmissionByProblemId({
      userId: this.ctx.state.user.uuid,
      problemId: this.ctx.request.body.problemId,
    });
    response.data = res;
  }
}
