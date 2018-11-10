let http = require('http');
let server = http.createServer();
server.on('request', doRequest);
server.listen(3000);
console.log('Server running!');
// リクエストの処理
function doRequest(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello World\n');
    res.end();
}
