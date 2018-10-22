var express = require('express');
var pgp = require('pg-promise')();
// var db = pgp(process.env. HEROKU_POSTGRESQL_DATABASE_URL);

var db = pgp('postgres://zyenusgppnblre:ffd912c16f1f131cc08a6079470346b92bd1a09ef31d5c4c2d9a1b651add4180@ec2-54-243-147-162.compute-1.amazonaws.com:5432/deli4r3tvtu87f?ssl=true');
var app = express();
var bodyParser = require('body-parser');
var moment = require('moment');
var time = moment().format();
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
    var sql = 'select* from products ';

    if (id) {
        sql += ' where product_id =' + id;
    }
    db.any(sql + ' order by product_id')
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
    var sql = "select * from products where product_id=" + pid;
    
    db.any(sql)
        .then(function (data) {
            res.render('pages/product_edit', { product: data[0], time: time })
        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })
});


//update product
app.post('/product/update', function (req, res) {
    var id = req.body.id;
    var title = req.body.title;
    var price = req.body.price;
    var sql = `update products set title = '${title}' ,price = ${price} where product_id = ${id}`;
    db.none(sql)
    console.log('Update' + sql);
    res.redirect('/products') //ส่งuserไปที่หน้าอื่นของเว็บ


});

//delete product
app.get('/product_delete/:pid', function (req, res) {
    var id = req.params.pid;
    var sql = 'delete from products';
    if (id) {
        sql += ' where product_id =' + id;
    }
    db.any(sql)
        .then(function (data) {
            console.log('DATA:' + data);
            res.redirect('/products') //ส่งuserไปที่หน้าอื่นของเว็บ
        })
        .catch(function (data) {
            console.log('ERROR:' + console.error);

        })
});

//add product form
app.get('/addProduct', function (req, res) {
    var time = moment().format();
    res.render('pages/product_add', { time: time })
});

//insert product to db
app.post('/product/insert', function (req, res) {
    var id = req.body.id;
    var title = req.body.title;
    var price = req.body.price;
    var time = req.body.time;
    var sql = `INSERT INTO products (product_id,title,price,created_at)
        VALUES ('${id}', '${title}', '${price}','${time}')`;
    db.any(sql)
        .then(function (data) {
            console.log('DATA:' + data);
            res.redirect('/products')
        })

        .catch(function (error) {
            console.log('ERROR:' + error);
        })

});

//Display all user
app.get('/users', function (req, res) {
    var id = req.param('id');
    var sql = 'select* from users ';
    if (id) {
        sql += ' where user_id =' + id;;
    }
    db.any(sql + ' order by user_id')
        .then(function (data) {
            console.log('DATA:' + data);
            res.render('pages/users', { users: data })
        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })

});

//display some users
app.get('/users/:pid', function (req, res) {
    var pid = req.params.pid;
    var sql = "select * from users where user_id=" + pid;


    db.any(sql)
        .then(function (data) {

            res.render('pages/user_edit', { users: data[0], time: time })

        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })


});

//delete user
app.get('/user_delete/:pid', function (req, res) {
    var id = req.params.pid;
    var sql = 'delete from users';
    if (id) {
        sql += ' where user_id =' + id;
    }
    db.any(sql)
        .then(function (data) {
            console.log('DATA:' + data);
            res.redirect('/users') //ส่งuserไปที่หน้าอื่นของเว็บ

        })
        .catch(function (data) {
            console.log('ERROR:' + console.error);
        })
});

//go to add user form
app.get('/addUser', function (req, res) {
    var time = moment().format();
    res.render('pages/user_add', { time: time })

});

//insert user to db
app.post('/user/insert', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var time = req.body.time;
    var sql = `INSERT INTO users (email,password,created_at)
            VALUES ('${email}', '${password}','${time}')`;
    db.any(sql)
        .then(function (data) {
            console.log('DATA:' + data);
            res.redirect('/users')
        })

        .catch(function (error) {
            console.log('ERROR:' + error);
        })

});

//update user
app.post('/user/update', function (req, res) {
    var id = req.body.id;
    var email = req.body.email;
    var password = req.body.password;
    var sql = `update users set user_id= ${id} ,email =  '${email}' ,password = '${password}' where user_id = ${id}`;
    
    db.none(sql)
    console.log('Update' + sql);
    res.redirect('/users') //ส่งuserไปที่หน้าอื่นของเว็บ


});

app.get('/product_report', function(req, res) {
    var sql ='select products.product_id,products.title,sum(purchase_items.quantity) as quantity,sum(purchase_items.price) as price from products inner join purchase_items on purchase_items.product_id=products.product_id group by products.product_id;select sum(quantity) as squantity,sum(price) as sprice from purchase_items';
    db.multi(sql)
    .then(function  (data) 
    {
 
        // console.log('DATA' + data);
        res.render('pages/product_report', { product: data[0],sum: data[1]});
    })
    .catch(function (data) 
    {
        console.log('ERROR' + error);
    })
});

app.get('/user_report', function(req, res) {
    var sql='select purchases.user_id,purchases.name,users.email,sum(purchase_items.price) as price from purchases inner join users on users.user_id=purchases.user_id inner join purchase_items on purchase_items.purchase_id=purchases.purchase_id group by purchases.user_id,purchases.name,users.email order by sum(purchase_items.price) desc LIMIT 25;'
    db.any(sql)
        .then(function (data) 
        {
            // console.log('DATA' + data);
            res.render('pages/user_report', { user : data });
        })
        .catch(function (data) 
        {
            console.log('ERROR' + error);
        })
});

//เป็นส่วนที่ไปดึงค่าที่heroku set  ไว้
var port = process.env.PORT || 8088;
app.listen(port, function () {
    console.log('App is running on http://localhost:' + port);
});