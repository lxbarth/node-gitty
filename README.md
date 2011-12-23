Simple git wrapper for node
---------------------------

## Usage

    var git = require('git');

    // Pull down a repository.
    var tree = './my-recipies';
    git.pull('git@github.com:lxbarth/main.git', tree, function(error) {
        git.open(tree, {name: 'Alex Barth', email: 'lxbarth@gmail.com'}, function(error, repo) {
            git.add('mac-and-cheese.md', function(err) {
                git.commit('-m"My Mac and Cheese recipe."', function(err) {
                    console.log('done');
                });
            });
        });
    });

## Test

    npm install expresso
    npm install
    npm test
