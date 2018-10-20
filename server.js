var express = require('express');
var pgp = require('pg-promise')();
// var db = pgp(process.env. HEROKU_POSTGRESQL_DATABASE_URL);

var db = pgp('postgres://zyenusgppnblre:ffd912c16f1f131cc08a6079470346b92bd1a09ef31d5c4c2d9a1b651add4180@ec2-54-243-147-162.compute-1.amazonaws.com:5432/deli4r3tvtu87f?ssl=true');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

//app.use(express.static ('static') );
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('pages/index');

});

app.get('/about', function (req, res) {
    var name = 'Jirawat Paenkaew';
    var hobbies = ['Music', 'Movie', 'Programming'];
    var bdate = '08/08/1997';
    res.render('pages/about', { fullname: name, hobbies: hobbies, bdate: bdate });

});
//Display all products
app.get('/products', function (req, res) {
    var id = req.param('id');
    var sql = 'select* from products';
    if (id) {
        sql += ' where id =' + id;
    }
    db.any(sql)
        .then(function (data) {
            console.log('DATA:' + data);
            res.render('pages/products', { products: data })

        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })
});


//display some product
app.get('/products/:pid', function (req, res) {
    var pid = req.params.pid;
    var sql = "select * from products where id=" + pid;
    db.any(sql)
        .then(function (data) {

            res.render('pages/product_edit', { product: data[0] })

        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })


});
//Display all user
app.get('/users', function (req, res) {
    var id = req.param('id');
    var sql = 'select* from users';
    if (id) {
        sql += ' where id =' + id;
    }
    db.any(sql)
        .then(function (data) {
            console.log('DATA:' + data);
            res.render('pages/users', { users: data })

        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })

});

//update data
app.post('/product/update',function (req, res) {
    var id = req.body.id;
    var title = req.body.title;
    var price = req.body.price;
    var sql =  `update products set title = '${title}' ,price = ${price} where id = ${id}`;
    db.none(sql)
    console.log('Update' + sql);
    res.redirect('/products') //ส่งuserไปที่หน้าอื่นของเว็บ


});




//เป็นส่วนที่ไปดึงค่าที่heroku set  ไว้
var port = process.env.PORT || 8080;
app.listen(port, function() {
console.log('App is running on http://localhost:' + port);
});