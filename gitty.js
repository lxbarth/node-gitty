// Low level git wrapper.

var spawn = require('child_process').spawn,
    fs = require('fs'),
    path = require('path');

var debug = false;

var clone = function(repo, dir, args, callback) {
    callback = callback ? callback : args;
    args = typeof args == 'object' ? args : [];
    return run(null, ['clone', repo, dir].concat(args), callback);
};

var init = function(tree, callback) {
    tree = path.resolve(tree);
    return run(tree, ['init'], callback);
};

var open = function(tree, user, callback) {
    tree = path.resolve(tree);
    path.exists(tree, function(exists) {
        callback(
            exists ? null : new Error('Working tree does not exist'),
            exists ? new Git(tree) : null
        );
    });
};

var run = function(cwd, args, callback) {
    callback = callback || function() {};
    var c = spawn('git', args, {cwd: cwd});
    if (debug) {
        c.stdout.on('data', console.log);
        c.stderr.on('data', console.error);
    }
    c.on('exit', callback);
    return c;
};

var Git = function(tree, user, email) {
    this.tree = tree;
    this.user = user;
};

['add', 'bisect', 'branch', 'checkout', 'clone', 'commit', 'diff', 'fetch',
'grep', 'log', 'merge', 'mv', 'push', 'rebase', 'reset', 'rm', 'show',
'status', 'tag'].forEach(function(command) {
    Git.prototype[command] = function(args, callback) {
        callback = (typeof args == 'function') ? args : callback;
        callback = callback || function() {};
        args = (typeof args == 'object') ? args : [];
        this.defaultArgs(command, args);
        return run(this.tree, [command].concat(args), callback);
    };
});

Git.prototype.defaultArgs = function(command, args) {
    switch(command) {
        case 'commit':
            args.push({
                '--author': this.user.name + ' <' + this.user.email + '>'
            });
            break;
    }
};

module.exports = {
    init: init,
    clone: clone,
    open: open,
    run: run,
    Git: Git,
    debug: debug
};
