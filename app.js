const  express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname+'/public'));//(1)
app.get('/', function(req, res){
  res.sendfile('./public/index.html');//(2)
});

http.listen(3000);
module.exports = app;
console.log("server is running at 3000port")
