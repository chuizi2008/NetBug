var cluster = require('cluster');

function AddFork(id)
{
	var worker = cluster.fork();
	worker.send(id);
	worker.ID = id;
}

if (cluster.isMaster) 
{
    AddFork(1);
    AddFork(2);

	cluster.on('fork', function(worker) {});
	
	cluster.on('exit', function(worker, code, signal) 
	{
		// 一旦工作进程崩了，自动重启
		console.log('worker   ID:[' + worker.ID + '] PID:[' + worker.process.pid + '] died, restart');
		AddFork(worker.ID);
	});
}
else
{
    process.on('message', function(msg) {
		if (msg == 1)
			worker = require('./JianDan/Main');
        else if (msg == 2)
			worker = require('./JianDan/Bug');
		else
		{
            console.log('无法识别的模块编号[' + msg + ']，启动请求取消');
			return;
		}

		worker.Start(msg);
	});
}


