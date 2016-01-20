var http = require('http');
var url = require('url');
var fs = require('fs');

/*
    貌似煎蛋会根据User-Agent进行屏蔽，所以尝试伪造几个....
    Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)
*/
var header = {}
header[0] = {'User-Agent:' : 'Opera/9.80 (Windows NT 6.1) Presto/2.12.388 Version/12.16'}
header[1] = {'User-Agent:' : 'Opera/9.80 (Macintosh; Intel Mac OS X 10.9.1) Presto/2.12.388 Version/12.16'}
header[2] = {'User-Agent:' : 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36 OPR/18.0.1284.68'}
header[3] = {'User-Agent:' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36 OPR/18.0.1284.68'}
header[4] = {'User-Agent:' : 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)'}
header[5] = {'User-Agent:' : 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)'}
header[6] = {'User-Agent:' : 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'}
header[7] = {'User-Agent:' : 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)'}
header[8] = {'User-Agent:' : 'Mozilla/5.0 (Windows NT 6.1; Intel Mac OS X 10.6; rv:7.0.1) Gecko/20100101 Firefox/7.0.1'}
header[9] = {'User-Agent:' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:7.0.1) Gecko/20100101 Firefox/7.0.1'}
var index = 0;
var maxIndex = 9;

var strUrl = "http://jandan.net/pic/page-{1}#comments";
// 判断是否有新的页面
var repr1 = /<a class="next-comment-page" href="(.+?)" title="Newer Comments">/gi;
// 获取图片区块
var repr2 = /<ol class="commentlist".*<\/ol>/gi;
// 获取所有链接
var repr3 = /<a href="(.+?)"/gi;
// 判断是否是图片链接
var repr4 = new RegExp("(.jpg|.png|.gif|.ps|.jpeg)$");
// 输出
var repr5 = '<img src="{1}"/><br/><br/><br/>';

function Start()
{
    // 定时通知帐号服务器我还活着
	Ping();
	setInterval(function()
	{
		Ping();
	}, 1 * 60 * 1000);
}

function Ping()
{
    var jiandan_id = +fs.readFileSync("./JianDan/jiandan.log","utf-8");
    var page_id = +fs.readFileSync("./JianDan/page.log","utf-8");
    page_id += 1;
    
    var mainPage = strUrl.replace("{1}", jiandan_id);
    var data = '<head><meta charset="utf-8"/></head>';
    getCommentPage(mainPage,function(imageUrls)
    {
        imageUrls.forEach(function(imageUrl)
        {
            if (repr4.test(imageUrl))
                data += repr5.replace("{1}", imageUrl);
        });
        data += '<span style="font-size:28px;color:blue;">已经没有啦～～～～～～～</span>';
        fs.writeFileSync('./JianDan/page/' + page_id + '.html', data);
        fs.writeFileSync('./JianDan/jiandan.log', jiandan_id + 1);
        fs.writeFileSync('./JianDan/page.log', page_id);
        console.log('抓取结束:' + mainPage);
    })
}

function getCommentPage(mainPage, callback)
{
    var options = {
      host: url.parse(mainPage).host,
      path: url.parse(mainPage).pathname,
      method: 'GET',
      headers : header[index]
    }
    index += 1;
    if (index >= maxIndex)
        index = 0;
    
    console.log('抓取中:' + mainPage);
    var httpClient = require('http');
    httpClient.get(options,function(res) 
	{
        res.setEncoding('utf8');
        var html = ''
        res.on('data', function(chunk) 
		{
            html += chunk;
        })
		
        res.on('end',function()
		{
            if (!repr1.test(html))
                return;
            html = html.replace(/\s/g," ")
            var commentlist = html.match(repr2)
            if (commentlist == undefined)
                return;
            
            var imageUrls = [];
            commentlist.forEach(function(elem){
                //循环查找，进行分组
                while(group = repr3.exec(elem)) {   
                    imageUrls.push(group[1])
                }
            })
                    
            callback(imageUrls);
        })
    }).on('error', function(e) 
	{
        console.error('err',e)
    })
}

exports.Start = Start;