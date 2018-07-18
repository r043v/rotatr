/* rotat'r - an auto folder trimer,
* * will limit your folder in files size &| numbers
 * © 2k15/2k18 noferi Mickaël - r043v / dph
 * under creative commons by-nc-sa 3.0
*/

var _ = require('lodash');
var fs = require('fs');
var async = require('async');

var dopts = {
	number:50,
	size:1024*1024*1024
};

function trimDir(dir,opts,cb){
	fs.readdir(dir,function(err,files){
		async.map(files,function(file,cb){
			fs.stat(dir+file,function(err,stat){
				stat.filename = file;
				cb(err,stat);
			});
		},function(err,files){
			files = _.sortBy( /* only files, sorted by newest first */
					_.filter(
						files,
						function(file){ return file.isFile(); }
					),
					function(file){ return file.mtime; }
				).reverse();

			opts = _.extend( {}, dopts, opts );

			var trim = [];//, valid = [];

			_.each(files,function( file ){
				if( opts.number && opts.size > file.size ){
					opts.number--; opts.size -= file.size;
					//valid.push( file );
				} else	trim.push( file );
			});

			if(! trim.length )
				return cb(null);

			async.each(trim,function(file, cb){
				var filename = dir+file.filename;
				console.log('rotator unlink',filename);
				fs.unlink(filename,cb);
			},function(){
				cb(null);
			});
		});
	});
}

function rtrimDir(dir,opts,cb){
	fs.readdir(dir,function(err,files){
		async.filter(files,function(file,cb){
			fs.stat(dir+file,function(err,stat){
				cb( stat.isDirectory() );
			});
		},function(dirs){
			async.each(dirs,function(d,cb){
				//console.log('triming',dir+d+'/');
				trimDir(dir+d+'/',opts,cb);
			},cb)
		});
	});
}

module.exports = {
	trimDir : trimDir,
	rtrimDir : rtrimDir
};
