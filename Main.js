var http = require('http');
var url = require('url');
var jiandan = require('./JianDan/Main.js');

exports = module.exports = function ()
{
    http.createServer(function (req, res)
    {
        var pathname = url.parse(req.url).pathname.replace('/', '');
        if (req.url == '/' && req.method.toLowerCase() === 'get')
        {
            res.writeHead(200, {'content-type': 'text/html'});
            res.write('<head><meta charset="utf-8"/></head>');
            res.write('<a href="/JianDan"><span style="font-size:20px;color:blue;">煎蛋</span></a></br>')
            res.write('<a href="/qiubaichengren"><span style="font-size:20px;color:blue;">糗百成人版</span></a></br>')
            res.end();
        }
        else if (pathname = 'JianDan')
        {
            jiandan.Start(req, res);
        }
	}).listen(3000, function () {
		console.log('test listening on *:3000');
	});
}