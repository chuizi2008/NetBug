var http = require('http');
var url = require('url');
var fs = require('fs');

var reprNum = /[0-9]+$/;
var repr = '<a href="/qiubaichengren?page={id}">{id}</a>&nbsp&nbsp';
var reprNow = '<a href="/qiubaichengren?page={id}"><span style="font-size:20px;color:blue;">[{id}]</span></a>&nbsp';

function PageCount(page_id)
{
    var pageID = {};
    
    
    // 最多搜索5次
    var index = 1;
    for (var n = page_id + 1; n > page_id - 4; n--)
    {
        if (index > 4)
            return pageID;
            
        if (fs.existsSync("./qiubaichengren/page/" + n + ".html"))
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
    res.write('<a href="/">返回到主页</a>');
        
    res.write('</div><div class="bottom" id="bottomData">');
    res.write(fs.readFileSync("./qiubaichengren/page/" + page_id + ".html","utf-8"));
    res.write('</div>');
    res.end();
}

function Start(req, res)
{
    var arg = url.parse(req.url, true).query;
    if (arg.page == null && req.method.toLowerCase() === 'get')
    {
        SendPage(res, +fs.readFileSync("./qiubaichengren/page.log","utf-8"));
    }
    else if (reprNum.test(arg.page))
    {
        SendPage(res, +arg.page);
    }
}
exports.Start = Start;