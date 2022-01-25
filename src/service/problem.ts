import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { ProblemModel } from '../model/problem';
import { RedisService } from '@midwayjs/redis';


@Provide()
export class ProblemService {
  @InjectEntityModel(ProblemModel)
  problemModel: ReturnModelType<typeof ProblemModel>;

  @Inject()
  redisService: RedisService;

  async create(user){
    const { _id: id } = await this.problemModel.create(user);
    return { id };
  }


  async find(user){
    try{
      const res = await this.problemModel.find(user).populate('sample');
      return res;
    }catch (e){
      console.log(e)
    }

  }
}
