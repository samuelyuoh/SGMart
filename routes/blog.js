const express = require('express');
const router = express.Router();
const moment = require('moment');
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path')
const e = require('connect-flash');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})

router.get('/viewBlogs', (req, res) => {
    Blog.findAll({
        raw: true
    })
        .then((blogs) => {
            res.render('blog/viewBlogs', { blogs });
            
        })
        .catch(err => console.log(err));
});

router.get('/detailBlog/:id', (req, res) => {
    Blog.findByPk(req.params.id)
    .then((blog) => {
        if (!blog) {
            // flashMessage(res, 'error', 'Blog not found');
            res.render('blog/listBlogs');
            return
        }
        res.render('blog/detailBlog', { blog });
    })
    .catch(err => console.log(err));
});

router.get('/listBlogs', (req, res) => {
    Blog.findAll({
        raw: true
    })
        .then((blogs) => {
            res.render('blog/listBlogs', { blogs , layout: 'admin'});
            
        })
        .catch(err => console.log(err));
});


router.get('/addBlog', (req, res) => {
    res.render('blog/addBlog', { layout: 'admin' });
});

router.post('/addBlog', upload.single('image') ,(req, res) => {
    let title = req.body.title;
    let article = req.body.article;
    let image = req.body.image
    let topic = req.body.topic
    let language = req.body.language.toString();


    Blog.create(
        { title, article, image, topic, language } 
    )
        .then((blog) => {
            console.log(blog.toJSON());
            res.redirect('/blog/listBlogs');
        })
        .catch(err => console.log(err))
});

router.get('/editBlog/:id', (req, res) => {
    Blog.findByPk(req.params.id)
    .then((blog) => {
        if (!blog) {
            // flashMessage(res, 'error', 'Blog not found');
            res.render('blog/listBlogs');
            return
        }
        res.render('blog/editBlog', { blog , layout: 'admin'});
    })
    .catch(err => console.log(err));
});

router.post('/editBlog/:id', (req, res) => {
    let title = req.body.title;
    let article = req.body.article;
    let image = req.body.image
    let topic = req.body.topic
    let language = req.body.language.toString();


    Blog.update(
        { title, article, image, topic, language },
        { where: { id: req.params.id } }
    )
        .then((result) => {
            console.log(result[0] + ' blog updated');
            res.redirect('/blog/listBlogs');
        })
        .catch(err => console.log(err))
});

router.get('/deleteBlog/:id', async function (req, res) {
    try {
        let blog = await Blog.findByPk(req.params.id);

        if (!blog) {
            // flashMessage(res, 'error', 'Blog not found');
            res.render('blog/listBlogs');
            return;
        }

        // if (req.user.id != blog.userId) {
        //     flashMessage(res, 'error', 'Unauthorised access');
        //     res.redirect('/blog/listBlogs');
        //     return;
        // }

        let result = await Blog.destroy({ where: { id: blog.id } });
        console.log(result + ' blog deleted');
        res.redirect('/blog/listBlogs');
    }
    catch (err) {
        console.log(err);
    }
});



module.exports = router;

