import { Controller, Provide, Inject, Post } from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import { Context } from 'egg';
import { FileService } from '../service/file';
const fs = require('fs');
const path = require('path');

@Provide()
@Controller('/api/file')
export class FileController {
  @Inject()
  ctx: Context;

  @Inject()
  redisService: RedisService;

  @Inject()
  fileService: FileService;

  @Post('/upload')
  async add() {
    const part = this.ctx.multipart();
    const stream = await part();
    const saveFileName = `${Date.now()}-${stream.filename}`;
    const savePath = this.ctx.app.config.IS_DEV
      ? path.resolve(`./upload-file/${saveFileName}`)
      : `/upload-file/${saveFileName}`;
    const writeStream = fs.createWriteStream(savePath);
    stream.pipe(writeStream);
    await new Promise<void>(resolve => {
      stream.on('close', () => {
        console.log('close');
        resolve();
      });
    });
    this.fileService.unzip(saveFileName);
    this.ctx.response.body.data = {
      file: saveFileName,
    };
  }

  @Post('/unzip')
  async unzip() {
    const file = this.ctx.request.body.file;
    const res = await this.redisService.get(file);
    if (res) {
      this.ctx.response.body.data = JSON.parse(res);
    }
  }
}
