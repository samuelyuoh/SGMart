const express = require('express');
const router = express.Router();
const moment = require('moment');
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path')
const e = require('connect-flash');
const Brand = require('../models/Brand'); 

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

router.get('/viewBlogs', async (req, res) => {
    var brands = await Brand.findAll();
    Blog.findAll({
        raw: true
    })
        .then((blogs) => {
            res.render('blog/viewBlogs', { blogs, brands });
            
        })
        .catch(err => console.log(err));
});

router.get('/detailBlog/:id', async (req, res) => {
    var brands = await Brand.findAll();
    Blog.findByPk(req.params.id)
    .then((blog) => {
        if (!blog) {
            // flashMessage(res, 'error', 'Blog not found');
            res.render('blog/listBlogs');
            return
        }
        res.render('blog/detailBlog', { blog, brands });
    })
    .catch(err => console.log(err));
});


router.get('/listBlogs', async (req, res) => {
    var brands = await Brand.findAll();
    Blog.findAll({
        raw: true
    })
        .then((blogs) => {
            res.render('blog/listBlogs', { blogs , layout: 'admin', brands});
            
        })
        .catch(err => console.log(err));
});


router.get('/addBlog', async (req, res) => {
    var brands = await Brand.findAll();
    res.render('blog/addBlog', { layout: 'admin', brands });
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

router.get('/editBlog/:id', async (req, res) => {
    var brands = await Brand.findAll();
    Blog.findByPk(req.params.id)
    .then((blog) => {
        if (!blog) {
            // flashMessage(res, 'error', 'Blog not found');
            res.render('blog/listBlogs');

            return
        }
        res.render('blog/editBlog', { blog , layout: 'admin', brands});
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

