const express = require("express");
const multer = require("multer");
const mysql = require("mysql");
const session = require("express-session")
const bcrypt = require("bcrypt")
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'))

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'rajmarde',
    password: 'rajmarde1816',
    database: 'artco'
})

connection.connect((err)=>{
    if (err) throw err;
    console.log('Connected');
})

app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
    })
  );
  
  app.use((req, res, next) => {
    if (req.session.username === undefined) {
      console.log("You are not logged in");
      res.locals.username = "Hello please sign in";
      res.locals.isLoggedIn = false;
    } else {
      console.log("You are Logged In");
      res.locals.username = req.session.username;
      res.locals.isLoggedIn = true;
    }
  
    next();
  });


app.get('/', (req, res)=>{
    res.render('index')
})

app.get('/signup', (req, res)=>{
    res.render('signup', {errors: []})
})

app.post('/signup',

(req, res, next)=>{
    const name = req.body.name
    const username = req.body.username
    const password = req.body.password

    const errors = []

    if(name === ''){
        errors.push('Name is empty')
    }
    if(username === ''){
        errors.push('username is empty')
    }
    if(password === ''){
        errors.push('password is empty')
    }

    if(errors.length > 0){
        res.render('signup', {errors: errors})
    } else {
        next();
    }

},

(req, res, next)=>{
    const username = req.body.username
    const errors = []
    
    connection.query(
        'SELECT * FROM buyer WHERE username = ?',
        [username],
        (err, results)=>{
            if(results.length > 0){
                errors.push('Username already exists');
                res.render('signup', {errors: errors})
            } else {
                next();
            }
        }
    )
},

(req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, 10, (err, hash) => {
      connection.query(
        "INSERT INTO buyer (name, username, password) VALUES (?,?,?)",
        [name,username, hash],
        (err, results) => {
          req.session.userId = results.insertId;
          req.session.username = username;
          console.log(results);
          res.redirect("/");
        }
      );
    });
  }

)

app.get("/login", (req, res) => {
    res.render("login", {errors: []});
  });

  app.post("/login", 
  (req, res, next)=>{
    const username = req.body.username
    const password = req.body.password

    const errors = []
    if(username === ''){
        errors.push('username is empty')
    }
    if(password === ''){
        errors.push('password is empty')
    }

    if(errors.length > 0){
        res.render('login', {errors: errors})
    } else {
        next();
    }

},
  
  
  (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    connection.query(
      "SELECT * FROM buyer WHERE username = ?",
      [username],
      (err, results) => {

        if(results[0] === undefined){
            res.render('login', {errors: ['User do not exists']})
        } else {
            const hash = results[0].password;
            if (results.length > 0) {
              bcrypt.compare(password, hash, (err, isEqual) => {
                if (isEqual) {
                  req.session.username = results[0].username;
                  req.session.userId = results[0].id;
                  res.render("feed");
                } else {
                  res.redirect("/login");
                }
              });
            } else {
              res.redirect("/login")
            }
        }

        
      }
    );
  });


  app.get('/sellerSignup',
    (req, res)=>{
        res.render('sellerSignup', {errors:[]});
    }
  )

  app.post('/sellerSignup', 
    
  (req, res, next)=>{
    const name = req.body.name
    const username = req.body.username
    const password = req.body.password
    const card = req.body.card

    const errors = []

    if(name === ''){
        errors.push('Name is empty')
    }
    if(username === ''){
        errors.push('username is empty')
    }
    if(password === ''){
        errors.push('password is empty')
    }
    if(card === ''){
        errors.push('card is empty')
    }

    if(errors.length > 0){
        res.render('sellerSignup', {errors: errors})
    } else {
        next();
    }

},

(req, res, next)=>{
    const username = req.body.username
    const errors = []
    
    connection.query(
        'SELECT * FROM seller WHERE username = ?',
        [username],
        (err, results)=>{
            if(results.length > 0){
                errors.push('Username already exists');
                res.render('sellerSignup', {errors: errors})
            } else {
                next();
            }
        }
    )
},

(req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    const card = req.body.card;

    bcrypt.hash(password, 10, (err, hash) => {
      connection.query(
        "INSERT INTO seller (name, username, password, card) VALUES (?,?,?, ?)",
        [name,username, hash, card],
        (err, results) => {
          req.session.userId = results.insertId;
          req.session.username = username;
          console.log(results);
          res.render("studio");
        }
      );
    });
  }

  )


  app.get('/loginseller', (req, res)=>{
    res.render("loginseller", {errors: []});
  })

  app.post('/loginseller', 
  (req, res, next)=>{
    const username = req.body.username
    const password = req.body.password

    const errors = []
    if(username === ''){
        errors.push('username is empty')
    }
    if(password === ''){
        errors.push('password is empty')
    }

    if(errors.length > 0){
        res.render('loginseller', {errors: errors})
    } else {
        next();
    }

},
  
  
  (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    connection.query(
      "SELECT * FROM seller WHERE username = ?",
      [username],
      (err, results) => {

        if(results[0] === undefined){
            res.render('login', {errors: ['User do not exists']})
        } else {
            const hash = results[0].password;
            if (results.length > 0) {
              bcrypt.compare(password, hash, (err, isEqual) => {
                if (isEqual) {
                  req.session.username = results[0].username;
                  req.session.userId = results[0].id;
                  res.render("studio");
                } else {
                  res.redirect("/loginseller");
                }
              });
            } else {
              res.render("/loginseller")
            }
        }

        
      }
    );
  }
  )


  app.get('/logiut', (req, res)=>{
      req.session.destroy()
  })
app.listen(3000, ()=>console.log('server started on port 3000'))
