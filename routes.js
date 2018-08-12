var express = require("express");
var User = require("./models/user");
var Notice = require("./models/notice");
var passport = require("passport");
var multer  = require('multer');
var path = require("path");
var acl=require('express-acl');

var passport=require("passport");

var router = express.Router();

var storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        id = Date.now();
        cb(null, file.fieldname + '-' + id + ".jpg");
    }
});

var upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('myImage');


function checkFileType(file, cb){
    var filetypes = /jpeg|jpg|png|gif/;
    var mimetype = filetypes.test(file.mimetype);

    if(mimetype){
        return cb(null, true);
    }
    else{
        cb('Error: Images Only');
    }
}

router.use((req,res,next)=>{
    res.locals.currentuser = req.User;

    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    if(req.User)
    {
        req.session.role=req.User.role;
    }
    if(req.session.role==undefined)
    {
        acl.config({
            defaultRole:'invitado'
        });
    }
    else
    {
        acl.config({
            defaultRole:req.session.role
        });
    }
    
    next();
});


router.use(acl.authorize);


router.get("/",(req,res,next)=>{
    Notice.find()
    .sort({ createdAt: "descending"})
    .exec((err,notices)=> {
        if(err){
            return next(err);
        }
        res.render("index" ,{notices: notices});
    });
});

router.get('/aboutus', function(req, res, next) {
	res.render('aboutus');
});


router.get('/culture', function(req, res, next) {
	Notice.find({categorie: 'Culture'})
    .sort({ createdAt: "descending"})
    .exec((err, notices)=> {
        if(err){
            return next(err);
        }
        res.render("culture" ,{notices: notices});
    });  
});

router.get('/politics', function(req, res, next) {
	Notice.find({categorie: 'Politics'})
    .sort({ createdAt: "descending"})
    .exec((err, notices)=> {
        if(err){
            return next(err);
        }
        res.render("politics" ,{notices: notices});
    }); 
});

router.get('/police', function(req, res, next) {
	Notice.find({categorie: 'Police'})
    .sort({ createdAt: "descending"})
    .exec((err, notices)=> {
        if(err){
            return next(err);
        }
        res.render("police" ,{notices: notices});
    }); 
});

router.get('/economic', function(req, res, next) {
	Notice.find({categorie: 'Economy'})
    .sort({ createdAt: "descending"})
    .exec((err, notices)=> {
        if(err){
            return next(err);
        }
        res.render("economic" ,{notices: notices});
    });  
});

router.get('/science', function(req, res, next) {
	Notice.find({categorie: 'Science'})
    .sort({ createdAt: "descending"})
    .exec((err, notices)=> {
        if(err){
            return next(err);
        }
        res.render("science" ,{notices: notices});
    }); 
});

router.get('/sports', function(req, res, next) {
	Notice.find({categorie: 'Sports'})
    .sort({ createdAt: "descending"})
    .exec((err, notices)=> {
        if(err){
            return next(err);
        }
        res.render("sports" ,{notices: notices});
    });
});

router.get("/signup",(req,res)=>{
    res.render("signup");
});

router.post("/signup",(req,res,next)=>{
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var role= req.body.role;

    User.findOne({username: username},(err,user)=>{
        if(err){
            return next(err);
        }
        if(user){
            req.flash("error","El nombre de usuario ya lo ha tomado otro zombie");
            return res.redirect("/signup");
        }
        var newUser = new User({
            username: username,
            email: email,
            password: password,
            role: role
        });
        newUser.save(next);
        return res.redirect("/login");
    });
});

    router.get("/search", (req, res, next)=>{
        res.render("search");
    });

    router.post("/search", (req, res, next)=>{
        var search = req.body.search;
        Notice.find({categorie: search}, (err, lu)=>{
            if(err){
                return (err);
            }
            if(lu){
                return res.render("search", {lu: lu});
            }
        })
    });

    router.get("/noticeAdd",(req,res)=>{
        res.render("noticeAdd");
        
    });
    router.post("/noticeAdd",(req,res,next)=>{
        upload(req, res, (err)=>{
            var notice = req.body.notice;
            var description = req.body.description;
            var categorie = req.body.categorie;
            if(err){
                return res.render("noticeAdd",{
                    msg: "Photo not found"
                });
            }
            else{
                if(req.file == undefined){
                    return res.render("noticeAdd", {
                        msg: 'Photo does not choose'
                    })
                }
                else{
                    Notice.findOne((err)=>{
                        var newNotice = new Notice({
                            notice: notice,
                            description: description,
                            categorie: categorie, 
                            id, id
                        });
                        newNotice.save(next);
                        return res.redirect("/notice_list");
                    })
                }
            }
        });
    });

    router.get("/notice_list",(req,res,next)=>{
        Notice.find()
        .sort({ createdAt: "descending"})
        .exec((err,notices)=> {
            if(err){
                return next(err);
            }
            res.render("notice_list" ,{notices: notices});
        });  
    });

    router.get("/login",(req,res)=>{
        res.render("login");
    });

    router.post("/login", passport.authenticate("login",{
        successRedirect:"/",
        failureRedirect:"/login",
        failureFlash:true
    }));

    router.get("/logout",(req,res)=>{
        req.logout();
        res.redirect("/");
    });

router.get("/edit", ensureAuthenticated,(req,res)=>{
            res.render("edit");
});

router.post("/edit",ensureAuthenticated,(req,res,next)=>{
    req.User.displayName=req.body.displayName;
    req.User.bio=req.body.bio;
    req.User.save((err)=>{
        if(err){
            next(err);
            return;
        }
        req.flash("info","Perfil Actualizado");
        res.redirect("/edit");
    });
});

function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash("info","Necesitas iniciar sesion para poder ver esta seccion");
        res.redirect("/login");
    }
}

module.exports = router;

    