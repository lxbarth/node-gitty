var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    git = require('gitty');

git.debug = true;

// From https://github.com/ryanmcgrath/wrench-js.
var rmdirRecursive = function(dir, clbk) {
    fs.readdir(dir, function(err, files){
        if (err) return clbk(err);
        (function rmFile(err){
            if (err) return clbk(err);

            var filename = files.shift();
            if (filename === null || typeof filename == 'undefined')
                return fs.rmdir(dir, clbk);

            var file = dir+'/'+filename;
            fs.stat(file, function(err, stat){
                if (err) return clbk(err);
                if (stat.isDirectory())
                    rmdirRecursive(file, rmFile);
                else
                    fs.unlink(file, rmFile);
            });
        })();
    });
};

exports.init = function() {
    var tree = path.resolve('./test/initrepo');
    rmdirRecursive(tree, function(err) {
        fs.mkdir(tree, '0755', function(err) {
            if (err) throw err;
            var init = git.init(tree, function(err) {
                if (err) throw err;
                path.exists(path.join(tree, '.git'), function(exists) {
                    assert.eql(exists, true);
                    rmdirRecursive(tree, function(err) {
                        if (err) throw err;
                    });
                })
            });
            init.stdout.on('data', function(data) {
                console.log(data.toString());
            });
        });
    });
};

exports.clone = function() {
    var tree   = path.resolve('./test/clonerepo');
    var remote = 'git@github.com:lxbarth/main.git';
    rmdirRecursive(tree, function(err) {
        var clone = git.clone(remote, tree, function(err) {
            if (err) throw err;
            path.exists(path.join(tree, 'honey_chicken.md'), function(exists) {
                assert.eql(exists, true);
                path.exists(path.join(tree, '.git'), function(exists) {
                    assert.eql(exists, true);
                    git.open(tree, {
                        name: 'Alex Barth',
                        email: 'lxbarth@gmail.com'
                    }, function(err, repo) {
                        if (err) throw err;
                        var log = repo.log();
                        var out = '';
                        log.stdout.on('data', function(data) { out += data; });
                        log.on('exit', function() {
                            assert.includes(out, 'Change to markdown');
                            assert.includes(out, 'Adam Kalsey');
                            assert.includes(out, 'Add Mongolian Beef');
                            rmdirRecursive(tree, function(err) {
                                if (err) throw err;
                            });
                        });
                    });
                });
            })
        });
        clone.stdout.on('data', function(data) {
            console.log(data.toString());
        });
    });
};
