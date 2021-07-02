var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = require('../models/User')
var Story = require('../models/Story')
var Comment = require('../models/Comment')
var Like = require('../models/Like')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken');
const config = require('../config');

mongoose.connect('mongodb://localhost/collections', { useFindAndModify: false, useUnifiedTopology: true });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("{ title: 'Express}");
});

router.post('/api/code', (req, res) => {
  let  data  = req.body;
  console.log(req)
  res.send(data)
})

router.post('/api/register', (req, res) => {

  let errors = [];
  let success = "";

  //Form validation
  let { email, password, confirm_password } = req.body;

  if(email === ""){
    errors = {"email": "Email cannot be empty"}
  }

  if(password === ""){
    errors = {"password": "Password cannot be empty"}
  }

  if (password !== confirm_password) {
    errors = {"match": "Passwords do not match"}
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        console.log(err)
      }
      new_password = hash;
      console.log(new_password)
      let newUser = new User({
        email,
        password: new_password
      });

      newUser.save((err, User) => {
        if(err){
          errors = {"registration": "Registration failed"};
        }else{
          console.log(User)
          res.send(User)
        }
      });
    
    })
  })

  console.log(errors)

})

// Post new stories
router.post('/api/story', (req, res) => {
  const {author, title, text} = req.body;

  let errors = {}

  if(author !== "" || title !== "" || text !== ""){
    const newStory = new Story({
      author,
      title,
      body: text
    })

    newStory.save()
    .then(response => {
      return res.send(response)
    })
    .catch(e => console.log(e))
  }else{
    errors = {"data" :"Fields cannot be empty"};
    return res.send(errors);
  }
});

router.get('/api/get/story', (req, res) => {
  let token = req.headers['x-access-token'];
  jwt.verify(token, config.secret, (err, response1) => {
      if(err){
        console.log(err)
      }
      Story.find({"is_draft": true})
      .then(response => {
        res.send(response)
      })
      .catch(e => console.log(e))
    })
});

router.get('/api/likes', (req, res) => {
  Like.find()
  .then(response => {
    res.send(response)
    console.log(response)
  })
  .catch(e => console.log(e))
})

router.get('/api/get/published/story', (req, res) => {
  Story.find({"is_draft": false})
  .then(response => {
    res.send(response)
    console.log(response)
  })
  .catch(e => console.log(e))
});


router.get('/api/get/published/story/filter', (req, res) => {
  
  const  { author } = req.body

  console.log(author)  
  Story.find({"is_draft": false})
  .then(response => {
    if(response.author == author){
        res.send(response)
    }
    console.log(response)
  })
  .catch(e => console.log(e))
});


router.post('/api/update', (req, res) => {
  const data  = req.body
  let id = data.data

  Story.findByIdAndUpdate({"_id": id}, {$set:{'is_draft': false}})
  .then(response => {
    res.send(response)
  })
  .catch(e => console.log(e));
});

router.post('/api/delete', (req, res) => {
  const data  = req.body
  let id = data.data

  Story.findOneAndRemove({"_id": id})
  .then(response => {
    res.send(response)
  })
  .catch(e => console.log(e));
});


router.post('/api/register/comment', (req, res) => {
  const { email, text } = req.body
  
  if(email !== "" | text !== ""){
    const comment = new Comment({
      email,
      text
    });

    comment.save()
    .then(response => {
      res.send(response)
      console.log(response)
    })
    .catch(e => console.log(e))
  }

})

router.post('/api/get/comment', (req, res) => {
    Comment.find()
    .then(response => {
      res.send(response)
      console.log(response)
    })
    .catch(e => console.log(e))

})

router.post('/api/likes', (req, res) => {
  const { count, like } = req.body
  console.log(count)

  if(like !== "" && like !== undefined && like !== null){
    

    Like.findOne({"author": like})
    .then(response => {
      console.log(res)
      if(response){
        console.log("user exits")
        Like.findOneAndUpdate({"author": like}, { $inc: { count:  1} })
        .then(new_data => {
          console.log(new_data.data)
        })
        .catch(e => console.log(e))
      }else{
        
        const newLike = new Like({
          author: like,
          count
        });

        newLike.save()
        .then(resp => {
          res.send(resp.data)
        })
        .catch(e => console.log(e))

      }
    })
    .catch(e => console.log(e))
  }

})

router.post('/api/login', (req, res, next) => {
  const { email, password } = req.body
  let token = ""

  User.findOne({"email": email})
  .then(resp => {
    if(resp !== ""){
      token = jwt.sign({id: resp._id}, config.secret, {
        //In 24hrs
        expiresIn: 86400
      })
      bcrypt.compare(password, resp.password)
      .then(response => {
        if(response){
          res.send({"auth": response, "token": token})
        }else{
          res.send({"auth": response})
        }

      })
      .catch(err => console.log(err))
    }
  })
  .catch(e => console.log(e))
})

module.exports = router;
