const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.Promise = Promise;

const User = require('./models/User');
const Exercise = require('./models/Excercise');
const ObjectId = mongoose.Types.ObjectId;

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', {
  useMongoClient: true
})

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/add', (req, res, next) => {
  let { userId, description, duration, date } = req.body;

  Exercise.create({userId, description, duration, date})
  .then((doc) => {
    let { _id, userId, description, duration, date } = doc;
    let exercise = { _id, userId, description, duration, date };

    console.log(exercise);
    res.json(exercise);
  })
  .catch(next);
})

app.get('/api/exercise/log', (req, res, next) => {
  
  let { userId, from, to, limit } = req.query
  let query = {
    userId
  }

  from = testDate(from)
  to = testDate(to)

  if (from && to) query.date = {$gte: from, $lte: to }
  else if (from) query.date = {$gte: from}
  else if (to) query.date = {$lte: to};

  limit = getLimit(limit);

  Exercise.find(query).limit(limit).select('-__v')
  .then((exercises) => {

    console.log(exercises);
    res.json(exercises);
  })
  .catch(next);
})

app.post('/api/exercise/new-user', (req, res, next) => {
  let { username } = req.body;

  User.create({username})
  .then((doc) => {
    let { _id, username } = doc;
    let user = { _id, username };

    console.log(user);
    res.json(user);
  })
  .catch(next);
})

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode = 400, errMessage
  if (err.code || err.code === 11000){
    errMessage = `${req.body.username} was already used!`;
  } else if (err.errors) {
    // mongoose validation error
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
    
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  console.log(errMessage);
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

function getLimit(limit){
  limit = parseInt(limit);
  if (isNaN(limit)){
    limit = 100
  } else if (limit > 250) {
    limit = 250;
  };
  return limit;
}

function testDate(date) {
  let good = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(date);
  return good ? new Date(date) : false;
}