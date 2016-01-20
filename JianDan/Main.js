var http = require('http');
var url = require('url');
var fs = require('fs');

var reprNum = /[0-9]+$/;
var repr = '<a href="/{id}">{id}</a>&nbsp&nbsp';
var reprNow = '<a href="/{id}"><span style="font-size:20px;color:blue;">[{id}]</span></a>&nbsp';

function PageCount(page_id)
{
    var pageID = {};
    
    
    // 最多搜索5次
    var index = 1;
    for (var n = page_id + 1; n > page_id - 4; n--)
    {
        if (index > 4)
            return pageID;
            
        if (fs.existsSync("./JianDan/page/" + n + ".html"))
        {
            pageID[index] = n;
            index++;
        }
    }
    
    return pageID;
}

function SendPage(res, page_id)
{
    res.writeHead(200, {'content-type': 'text/html'});
    res.write('<head><meta charset="utf-8"/></head>')
    res.write('<div class="top" style="display:block; width:1920px; height:40px; line-height:45px; font-weight:bold; border:1px solid #F00; margin-bottom:10px; position: fixed;_position: absolute;top:0; background-color:#F00;z-index:9">');
    
    var pageID = PageCount(page_id);
    console.log(pageID);
    for (var n in pageID)
    {
        if (pageID[n] == page_id)
            res.write(reprNow.replace('{id}', pageID[n]).replace('{id}', pageID[n]));
        else
            res.write(repr.replace('{id}', pageID[n]).replace('{id}', pageID[n]));
    }
        
    res.write('</div><div class="bottom" id="bottomData">');
    res.write(fs.readFileSync("./JianDan/page/" + page_id + ".html","utf-8"));
    res.write('</div>');
    res.end();
}

function Start()
{
    http.createServer(function (req, res)
    {
        var pathname = url.parse(req.url).pathname.replace('/', '');

        if (req.url == '/' && req.method.toLowerCase() === 'get')
        {
            SendPage(res, +fs.readFileSync("./JianDan/page.log","utf-8"));
        }
        else if (reprNum.test(pathname))
        {
            SendPage(res, +pathname);
        }
	}).listen(3000, function () {
		console.log('test listening on *:3000');
	});
}
exports.Start = Start;