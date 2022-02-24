const defaultOptions = {
  lowercase: true, // 随机小写字母
  uppercase: true, // 随机大写字母
  number: true, // 随机数字
  customString: undefined, // 自定义字符串
};
/**
 * 生成随机的英文数字字符串
 * @param length 字符串长度
 * @param options
 * @returns {string}
 */
export const generateString = (length = 6, options = defaultOptions) => {
  const lowercase = 'qwertyuiopasdfghjklzxcvbnm';
  const uppercase = 'QWERTYUIOPASDFGHJKLZXCVBNM';
  const number = '1234567890';
  let str = '';
  options.lowercase !== false && (str += lowercase);
  options.number !== false && (str += number);
  options.uppercase !== false && (str += uppercase);
  options.customString &&
    options.customString.length > 0 &&
    (str = options.customString);
  const strLength = str.length;
  let res = '';
  for (let i = 0; i < length; i++) {
    const random = Math.round(Math.random() * 100) % strLength;
    res += str[random];
  }
  return res;
};

const { createHash } = require('crypto');
/**
 * 生成字符串的哈希值
 * @param source {string} 源字符串
 * @return {string} 哈希值
 */
export const generateHash = (source: string): string => {
  const hash = createHash('sha256');
  hash.update(source);
  return hash.digest('hex');
};
