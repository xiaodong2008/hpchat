const http = require('http');
const userLogin = require('./user/login.js');

const server = http.createServer((req, res) => {
  const response = require('./response.js')(res);

  const path = req.url.split('?')[0];

  if (req.url === '/user/userdata') {
    response(200, {
      "success": true,
      "isLogin": false,
      "data": null
    })
  } else if (req.url === '/user/login') {
    userLogin(req, res);
  } else {
    response(404, `404 Not Found: ${path}`, false);
  }
})

server.listen(1051, () => {
  console.log('Server is running at http://localhost:1051');
})