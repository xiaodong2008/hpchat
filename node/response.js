const fs = require('fs');

function responseSetup(res) {
  return (code, data, json = true) => {
    // if is obj
    if (typeof data === 'object') data = JSON.stringify(data);
    if (!fs.existsSync('log.txt')) {
      fs.writeFileSync('log.txt', '')
    }
    const log = fs.readFileSync('log.txt');
    const path = res.req.url;
    let body = JSON.stringify(res.req.body);
    let ip = res.req.connection.remoteAddress.replace('::ffff:', '');
    const message = `[${code}] ${new Date().toLocaleString()} | ${ip} | ${path} | ${data} | ${body}\n`;
    fs.writeFileSync('log.txt', message + log);
    res.writeHead(code, {
      "Content-Type": json ? "application/json" : "text/plain",
    });
    res.end(data);
  }
}


module.exports = responseSetup