import { Config, Inject, Provide } from '@midwayjs/decorator';
import { RedisService } from '@midwayjs/redis';
import { SystemInfoService } from './system';
import { zip } from 'compressing';
const fs = require('fs');
const path = require('path');

const computeFileMd5 = filePath => {
  const crypto = require('crypto');
  const stream = fs.createReadStream(filePath);
  const hash = crypto.createHash('md5');
  stream.on('data', chunk => {
    hash.update(chunk, 'utf8');
  });
  return new Promise(resolve => {
    stream.on('end', () => {
      const md5 = hash.digest('hex');
      resolve(md5);
    });
  });
};
@Provide()
export class FileService {
  @Inject()
  redisService: RedisService;

  @Inject()
  systemInfoService: SystemInfoService;

  @Config('IS_DEV')
  IS_DEV: boolean;

  async unzip(saveFileName: string) {
    const savePath = this.IS_DEV
      ? path.resolve(`./upload-file/${saveFileName}`)
      : `/upload-file/${saveFileName}`;
    const dirName = saveFileName.replace(/\./g, '');
    const unzipPath = this.IS_DEV
      ? path.resolve(`./upload-file/${dirName}`)
      : `/upload-file/${dirName}`;
    // 解压
    await zip.uncompress(savePath, unzipPath);

    const dirFileList = fs.readdirSync(unzipPath);
    dirFileList.sort((a, b) => {
      const aName = Number(a.replace(/([^.]+)$/, ''));
      const bName = Number(b.replace(/([^.]+)$/, ''));
      return aName - bName;
    });

    const input = [];
    const output = [];
    for (const fileName of dirFileList) {
      if (!fileName.endsWith('.in') && !fileName.endsWith('.out'))
        throw new Error('unexpected file');
      const info = fs.statSync(unzipPath + '/' + fileName);
      const list = fileName.endsWith('.in') ? input : output;
      const md5 = await computeFileMd5(unzipPath + '/' + fileName);
      list.push({
        name: fileName,
        size: Math.ceil(info.size / 1000),
        md5,
      });
    }

    const res = {
      samples: [],
      dirName,
    };
    for (let i = 0; i < input.length; i++) {
      res.samples.push({
        input: input[i],
        output: output[i],
      });
    }
    await this.redisService.set(saveFileName, JSON.stringify(res));
  }

  async moveSample(dirName: string, problemId: string) {
    const unzipPath = this.IS_DEV
      ? path.resolve(`./upload-file/${dirName}`)
      : `/upload-file/${dirName}`;
    const samplePath = this.IS_DEV
      ? path.resolve(`./upload-file/${problemId}`)
      : `/www/wwwroot/judge/sample/${problemId}`;
    await new Promise(resolve => {
      fs.rename(unzipPath, samplePath, e => {
        resolve(e);
      });
    });
  }
}
