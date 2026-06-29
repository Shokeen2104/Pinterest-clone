const express = require("express");
const path = require("path");
const app = express();
const session = require('express-session');

const indexRouter = require("./routes/index");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// static + body parsers
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// session (simple memory store - replace in production)
app.use(session({
    secret: 'replace-with-secure-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use("/", indexRouter);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});