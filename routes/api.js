var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  notes: [{text: String, state: String}]
});

const User = mongoose.model('User', userSchema);

router.get('/user', function (req, res, next) {
  User.find((err, resp)=>{
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resp));
  });
});

router.get('/user/:id', function (req, res, next) {
  User.find({_id: req.params.id}, (err, resp)=>{
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resp));
  });
});

router.get('/user/name/:name', function (req, res, next) {
  User.findOne({name: req.params.name}, (err, resp)=>{
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resp));
  });
});

router.post('/user', function (req, res, next) {
  if(req.body.name){
    const user = new User({name: req.body.name});
    user.save().then(()=>{
      res.end(JSON.stringify({status: 'OK'}))
    });
  } else {
    next(new Error('No valid data'));
  }
});

router.post('/user/:id/note', function (req, res, next) {
  if(req.body.note){
    User.findOne({_id: req.params.id}, (err, resp)=>{
      resp.notes.push({text:req.body.note.text, state: 'active'});
      resp.save().then(()=>{
        User.findOne({_id: req.params.id}, (err, resp2)=>{
          const id = resp2.notes.find(note=> note.text == req.body.note.text)._id;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({status: 'OK', id}));
        });
      })
    });
  }else {
    next(new Error('No valid data'));
  }
});

router.put('/user/:id/note/:id_note/state', function (req, res, next) {
  if(req.body.state){
    User.findOne({_id: req.params.id}, (err, resp)=>{
      resp.notes.find(note => note._id == req.params.id_note).state = req.body.state !== 'active' ? 'inactive' : 'active';
      resp.save();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({status: 'OK'}));
    });
  }else {
    next(new Error('No valid data'));
  }
});

module.exports = router;