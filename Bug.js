exports = module.exports = function ()
{
    require('./qiubaichengren/Bug.js')();
    
	setInterval(function()
	{
		require('./JianDan/Bug.js')();
	}, 1 * 60 * 1000);
}