var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    git = require('gitty'),
    tree = path.resolve('./test/_repo'),
    clonetree = path.resolve('./test/_clonerepo'),
    docs = path.resolve('./test/docs');

git.options.verbose = true;

// From https://github.com/miccolis/projectmill.
var serial = function(steps, done) {
    // From underscore.js
    var wrap = function(func, wrapper) {
        return function() {
          var args = [func].concat(Array.prototype.slice.call(arguments));
          return wrapper.apply(this, args);
        };
    };
    // And run!
    (steps.reduceRight(wrap, done))();
};

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

var init = function(callback, err) {
    if (err) return callback(err);
    rmdirRecursive(tree, function(err) {
        fs.mkdir(tree, '0755', function(err) {
            if (err) return callback(err);
            git.init(tree, function(err) {
                if (err) throw err;
                path.exists(path.join(tree, '.git'), function(exists) {
                    assert.eql(exists, true);
                    callback();
                })
            });
        });
    });
};

var populate = function(callback, err) {
    if (err) callback(err);
    var spawn = require('child_process').spawn;
    var copy = function(file) {
        return function(cb, err) {
            spawn('cp', [
                path.join(docs, file),
                path.join(tree, file)
            ]).on('exit', cb);
        };
    };
    fs.readdir(docs, function(err, files) {
        if (err) return callback();
        var actions = [];
        files.forEach(function(file) {
            file[0] != '.' && actions.push(copy(file));
        });
        serial(actions, callback);
    });
};

var commit = function(callback, err) {
    git.open(tree, {
        name: 'Alex Barth',
        email: 'lxbarth@gmail.com'
    }, function(err, repo) {
        repo.add(['*.md'], function(err) {
            repo.commit(['-m"Initial commit"'], callback);
        });
    });
};

var clone = function(callback, err) {
    if (err) return callback(err);
    rmdirRecursive(clonetree, function(err) {
        git.clone(tree, clonetree, function(err) {
            if (err) return callback(err);
            git.open(tree, null, function(err, repo) {
                if (err) throw err;
                var log = repo.log();
                var out = '';
                log.stdout.on('data', function(data) { out += data; });
                log.on('exit', function() {
                    assert.includes(out, 'Author: Alex Barth <lxbarth@gmail.com>');
                    assert.includes(out, '"Initial commit"');
                    callback();
                });
            });
        });
    });
};

var remove = function(callback, err) {
    rmdirRecursive(tree, function() {
        rmdirRecursive(clonetree, function() {
            callback(err);
        });
    });
};

module.exports.basics = function() {
    serial([
        init,
        populate,
        commit,
        clone,
        remove
    ], function(err) {
        if (err) throw err;
    });
};
