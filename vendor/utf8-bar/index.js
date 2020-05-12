const B = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
const length = B.length;
const fullBlock = B[length - 1];

const utf8Bar = (characters, percent) => {
  const totalTicks = length * characters;
  const ticks = Math.round(totalTicks * percent);

  let str = fullBlock.repeat(Math.floor(ticks / length));

  const remainder = ticks % length;

  if (remainder) {
    str += B[remainder - 1];
  }

  if (str.length < characters) {
    str += ' '.repeat(characters - str.length);
  }

  return str;
};

module.exports = utf8Bar;
