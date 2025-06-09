const truncate = (text = '', max = 2093) =>
  text.length > max ? text.slice(0, max - 3) + '...' : text;

module.exports = { truncate };
