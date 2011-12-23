Simple git wrapper for node
---------------------------

## Usage

    var git = require('git');

    // Pull down a repository.
    var tree = './my-recipies';
    git.pull('git@github.com:lxbarth/main.git', tree, function(error) {
        git.open(tree, {name: 'Alex Barth', email: 'lxbarth@gmail.com'}, function(error, repo) {
            repo.status(function(err, result) {
                console.log(result);
            });
            var log = repo.log();
            log.on('data', console.log);
            log.on('exit', function(console.log('done.')));
        });
    });

## Test

    npm install expresso
    npm install
    npm test
