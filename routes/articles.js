const express = require('express');
const router = express.Router();

// bring in the model Article Model so this folder knows what Article model is
let Article = require('../models/article');
// User Model
let User = require('../models/user');

// changing all the app.get app.post to router.  when it was in app.js it new app now it doesn't
// now it will know router as we defined it.
// also changing all the /articles/ routes appropriately



// add route
router.post('/add', async (req, res) => {
    // this part is for validation 
    req.checkBody('title', 'Title is required').notEmpty();
    //req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();
    
    // get errors
    let errors = req.validationErrors();
    if(errors) {
        // if errors just re-render the template + alert error
        res.render('add_article', {
            // passing pageTitle same as app.get('/articles/add') down below
            // if we didnt pass this value back it would become blank nbd just see it working
            pageTitle: 'Add Article',
            errors:errors
        });
    } else {
        // else do what we exactly want if there are no errors.
        // this is the main function of app.post(add) 
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(function(err) {
            if(err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article Added');
                res.redirect('/articles');
            }
        });
        /* // going a diff route  this worked great though for adding to DB
        const {title, author, body} = req.body;
        const article = await Article.create({
            title,
            author,
            body,
        });
        req.flash('success', 'Article Added');
        res.redirect('/articles');
        res.send(article);
        */
    }
});

// Load edit Form
// remember .get is getting the page  .post is editing the DB info
// so .get here is the webpage holding the DB info from .post /articles/edit/:id
router.get('/edit/:id', ensureAuthenticated, async (req, res)  => {
    Article.findById(req.params.id, function(err, article) {
        if(article.author != req.user._id) {
            req.flash('danger', 'Not Authorized');
            res.redirect('/articles');
        }
        res.render('edit_article', {
            
            article: article
        });
    });
});

router.get('/add', ensureAuthenticated, function(req, res) {
    //Article.create({title:"article One",author:"Stephen Williams",body:"big big balls"});
    res.render('add_article', {
        pageTitle: 'Add Article'
    });
});


// update submit edit
router.post('/edit/:id', async (req, res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article, function(err) {
        if(err) {
            console.log(err);
            return;
        } else {
            req.flash('success', 'Article Updated');
            res.redirect('/articles');
        }
    });
});

// Delete article
router.delete('/:id', function(req, res) {
    if(!req.user._id) {
        res.status(500).send();
    }

    // lets set _id to req.params.id
    let query = {_id:req.params.id}

    Article.findById(req.params.id, function(err, article) {
        if(article.author != req.user._id) {
            res.status(500).send();
        } else {
            Article.remove(query, function(err) {
                if(err) {
                    console.log(err);
                }
                res.send('great success');
            });
        }
    });
});

router.get('/', async (req, res) => {
    Article.find({}, function(err, articles) {
        if(err) {
            console.log(err);
        } else {
            res.render('articlesList', {
                pageTitle: 'List of Articles',
                articles:articles
            });
        }
    });
});

// GET single article
router.get('/:id', async (req, res)  => {
    Article.findById(req.params.id, function(err, article) {
        // article.author from add article now contains the _id 
        User.findById(article.author, function(err, user) {
            res.render('article', {
                article:article,
                // now lets set the author from article.author to .name
                author: user.name
            });
        });
    });
});

// Access Control
// now we can add this function to any page we want to ensure login access
function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please Log In');
        res.redirect('/users/login');
    }
}


// now we export this folder
module.exports = router;

/* // also keep in mind this is still app. becuase it was written in our app.js folder
// and the /article/ path is still there it should be chopped since this is now in routes folder
// update submit edit
app.post('/article/edit/:id', async (req, res) => {
    let article = {};
    const { title, author, body } = req.body
    let query = {_id:req.params.id}
    let newArticle = await Article.update({
        title,
        author,
        body,
    })
    res.redirect('/');
    res.send(newArticle);
})
*/
/*
app.put('/articles/:id', async (req, res) => {
    const { id } = req.params
    const { title, author, body } = req.body

    const article = await Article.update({
        _id: id,
    },{    
        title,
        author,
        body,
    })
    res.send(article)
})
*/