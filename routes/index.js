var express = require('express');
var router = express.Router();

const userModel = require("./users");
const postModel = require("./post");
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload dir
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage });

// Home - render feed of pins
router.get('/', async function(req, res, next) {
  try {
    // fetch posts with user info (if DB connected)
    let posts = [];
    try {
      posts = await postModel.find({}).sort({ createdAt: -1 }).populate('user');
    } catch (e) {
      // if DB not ready, continue with empty posts
      posts = [];
    }
    res.render('home', { posts });
  } catch (err) {
    next(err);
  }
});

router.get('/allusers', async function(req, res, next) {
    try {
        let allusers = await userModel.findOne({_id:"6a3fa7cfbd6b9c10db99d649"}).populate("posts");
        res.send(allusers);
    } catch (err) {
        next(err);
    }
});

// Register
router.get('/register', function(req, res){
  res.render('register', { error: null });
});

router.post('/register', async function(req, res, next){
  try {
    const { username, fullname, email, password } = req.body;
    if (!username || !fullname || !email || !password) return res.render('register', { error: 'All fields required' });
    const existing = await userModel.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.render('register', { error: 'Username or email already taken' });
    const hash = bcrypt.hashSync(password, SALT_ROUNDS);
    const user = await userModel.create({ username, fullname, email, password: hash });
    req.session.userId = user._id;
    res.redirect('/profile');
  } catch (err) { next(err); }
});

// Login
router.get('/login', function(req, res){
  res.render('login', { error: null });
});

router.post('/login', async function(req, res, next){
  try {
    const { identifier, password } = req.body; // identifier can be username or email
    if (!identifier || !password) return res.render('login', { error: 'Provide credentials' });
    const user = await userModel.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) return res.render('login', { error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.render('login', { error: 'Invalid credentials' });
    req.session.userId = user._id;
    res.redirect('/profile');
  } catch (err) { next(err); }
});

router.get('/logout', function(req, res){
  req.session.destroy(()=>{
    res.redirect('/');
  });
});

// Profile (simple)
router.get('/profile', async function(req, res, next){
  try {
    if (!req.session.userId) return res.redirect('/login');
    const user = await userModel.findById(req.session.userId).populate({ path: 'posts', options: { sort: { createdAt: -1 } } });
    res.render('profile', { user, session: req.session });
  } catch (err) { next(err); }
});

// Public profile by username
router.get('/user/:username', async function(req, res, next){
  try {
    const username = req.params.username;
    const user = await userModel.findOne({ username }).populate({ path: 'posts', options: { sort: { createdAt: -1 } } });
    if (!user) return res.status(404).send('User not found');
    res.render('profile', { user, session: req.session });
  } catch (err) { next(err); }
});

router.get('/createuser', async function(req, res, next) {
    try {
        let createduser = await userModel.create({
            username: "Vishesh3",
            fullname: "Vishesh Shokeen23",
            email: "vishesh23@apple.com",
            password: "nonce23",
        });
        res.send(createduser);
    } catch (err) { next(err); }
});

// Upload profile picture / update bio
router.post('/profile/upload', upload.single('image'), async function(req, res, next){
  try {
    if (!req.session.userId) return res.redirect('/login');
    const user = await userModel.findById(req.session.userId);
    if (!user) return res.redirect('/login');
    if (req.file) {
      user.dp = '/uploads/' + req.file.filename;
    }
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    await user.save();
    res.redirect('/profile');
  } catch (err) { next(err); }
});

// Create a pin (post) with optional image
router.post('/post/create', upload.single('image'), async function(req, res, next){
  try {
    if (!req.session.userId) return res.redirect('/login');
    const { postText, tags } = req.body;
    const postData = { postText: postText || '', user: req.session.userId };
    if (req.file) postData.image = '/uploads/' + req.file.filename;
    if (tags) postData.tags = tags.split(',').map(t=>t.trim()).filter(Boolean);
    const created = await postModel.create(postData);
    const user = await userModel.findById(req.session.userId);
    user.posts.push(created._id);
    await user.save();
    res.redirect('/profile');
  } catch (err) { next(err); }
});

router.get('/createpost', async function(req, res, next) {
    try {
        let createdpost = await postModel.create({
            postText:"Ram Ram",
            user:"6a3fa7cfbd6b9c10db99d649",
        });
        let user = await userModel.findOne({"_id": "6a3fa7cfbd6b9c10db99d649"});
        user.posts.push(createdpost._id);
        await user.save();
        res.send("done");
    } catch (err) { next(err); }
});

module.exports = router;