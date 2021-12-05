const express = require("express");
const multer = require("multer");
const mysql = require("mysql");
const path = require('path')

//set storage engine for multer

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb)=>{
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

//init uploads

const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000},
    //to specify which type of file must be uploaded
    fileFilter: (req, file, cb)=>{
        checkFileType(file, cb)
    }
}).single('myImg');

//checkFileType function (custom func)

function checkFileType(file, cb){
    //Allowed extensions

    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    //check mime

    const mimetype = fileTypes.test(file.mimetype)

    if(mimetype && extname){
        return cb(null, true) 
    } else{
        cb('Err: Images only')
    }
}

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



app.get('/', (req, res)=>{
    connection.query(
        'SELECT * FROM users',
        (err, results)=>{
            res.render('index', {userName: results[0].name})
        }
    )
})

app.get('/add', (req, res)=>{
    res.render('add')
})

app.post('/', (req, res)=>{
    upload(req, res, (err)=>{

        connection.query(
            'SELECT * FROM users',
            (err, results)=>{
                if(err){
                    res.render('app', {msg: err})
                } else {
                    if(req.file == 'undefined'){
                        res.render('app', {msg: 'No file selected'})
                    } else {
                        res.render('index', {userName: results[0].name, file: `uploads/${req.file.filename}`})

                    }
                    
                }
            }
        )


    })
})

app.listen(3000, ()=>console.log('server started on port 3000'))
