var http = require('http');
var url = require('url');
var fs = require('fs');
var iconv = require('iconv-lite')  
var cheerio = require('cheerio')  

var originRequest = require('request')  

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
var index = 9;
var maxIndex = 9;

var strUrl = "http://www.qiubaichengren.com//{1}.html";

//var repr1 = /<div class="mtitle"><a href=(.+?)<\/a><\/span><\/p>/gi;
var repr1 = /<div class="mtitle"><a href=(.+?)<\/a><\/span><\/p>/gi;
var repr2 = /src="(.+?)"/gi;
var repr3 = '<img src="{1}"/><br/><br/><br/>';
var repr4 = /<a href='(.+?).html'>末页<\/a>/gi;
var page_id = +fs.readFileSync("./qiubaichengren/page.log","utf-8");

exports = module.exports = function ()
{
    var qiubaichengren_id = +fs.readFileSync("./qiubaichengren/qiubaichengren.log","utf-8");
    var mainPage = '';
    if (qiubaichengren_id == 0)
        mainPage = 'http://www.qiubaichengren.com/';
    else
        mainPage = strUrl.replace("{1}", qiubaichengren_id);
    
    var data = '<head><meta charset="utf-8"/></head>';
    getCommentPage(mainPage,function(imageUrls)             
    {
        var data = "";
        imageUrls.forEach(function(imageUrl)
        {
            data += repr3.replace("{1}", imageUrl);
        });
        data += '<span style="font-size:28px;color:blue;">已经没有啦～～～～～～～</span>';

        page_id += 1;
        fs.writeFileSync('./qiubaichengren/page/' + page_id + '.html', data);
        if (qiubaichengren_id > 0)
            qiubaichengren_id -= 1;
        fs.writeFileSync('./qiubaichengren/qiubaichengren.log', qiubaichengren_id);
        fs.writeFileSync('./qiubaichengren/page.log', page_id);
        console.log('抓取结束:' + mainPage);
    })
}

function request(url, callback) 
{
    var options = {
        url: url,
        encoding: null,
        headers: header[index]
    }
    index += 1;
    if (index >= maxIndex)
        index = 0;
  
  originRequest(options, callback)
}

function getCommentPage(urls, callback)
{
    console.log('抓取中:' + urls);
    request(urls, function (err, res, body) {  
        var html = iconv.decode(body, 'gb2312');
        var maxID = 0;

        while (group = repr4.exec(html))
            maxID = +group[1];
        if (page_id == maxID)
            return;

        var imageUrls = [];
        var $ = cheerio.load(html, {decodeEntities: false})
        $("div[class=mala-text]").each(function(i, e) {
            var src = $(e).find('img').attr('src');
            if (!(src == null || src == undefined || src == ''))
                imageUrls.push($(e).find('img').attr('src'));
        });
        callback(imageUrls);
    });

    //callback(commentlist);
        
        /*
    var $ = cheerio.load(html, {decodeEntities: false})
    $("a").each(function(i, e) {
        console.log($(e).attr("href"));
    });*/
}

function getCommentPage1(urls, callback)
{
    var options = {
      host: url.parse(urls).host,
      path: url.parse(urls).pathname,
      method: 'GET',
      port : 80,
      headers : header[index]
    }
    index += 1;
    if (index >= maxIndex)
        index = 0;
    
    console.log('抓取中:' + urls);
    var httpClient = require('http');
    httpClient.get(options,function(res) 
	{
        res.setEncoding('utf8');
        var html = ''
        res.on('data', function(chunk) 
		{
            html += chunk;
            console.log('0');
        })
		
        res.on('end',function()
		{
            html = html.replace(/\s/g," ");
            fs.writeFileSync('./test.html', html);
            while(group = repr4.exec(html))
                console.log(group[1]);
            
            console.log('1');
            var commentlist = html.match(repr1)
            if (commentlist == undefined)
                return;

            console.log('2');
            //callback(commentlist);
        })
    }).on('error', function(e) 
	{
        console.error('err',e)
    })
}

function get(mainPage, callback)
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
            while(group = repr2.exec(html))
                data += repr3.replace("{1}", group[1]);
        })
    }).on('error', function(e) 
	{
        console.error('err',e)
    })
}