const express = require('express')
const app = express()
const port = 3000
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
var jsonParser = bodyParser.json()
var expressMongoDb = require('express-mongo-db');
app.use(expressMongoDb('mongodb://localhost:27017/excellence'));
 

app.get('/get_candidate', (req, res) => {
  req.db.collection("candidates").find({}).toArray(function(err, result) {
    if (err) throw err;
    res.send(result)
  });
})

app.get('/highest_score', (req, res) => {
  candidate_list = {}
  candidate_round_avg = {}

  req.db.collection("test_score").find({}).toArray(function(err, result) {
    if (err) throw err;
    for(cand in result) {      
      candidate_list[result[cand]["candidate_id"]] = result[cand]["first_round_score"] + result[cand]["second_round_score"] + result[cand]["third_round_score"];
      candidate_round_avg[result[cand]["candidate_id"]] = parseFloat(candidate_list[result[cand]["candidate_id"]]  / 3).toFixed(2)
    }

    Object.keys(candidate_list).reduce(function(a, b){ return candidate_list[a] > candidate_list[b] ? a : b });
   
    req.db.collection("candidates").findOne({'_id':ObjectId(Object.keys(candidate_list)[0])}, function(err, result) {
     
      highest_score_candidate = result
      highest_score_candidate["score"] = Object.values(candidate_list)[0]
      res.send({'highest_score':highest_score_candidate, 'candidate_round_avg':candidate_round_avg})
    })

   
  });
})

app.post('/create_candidate', jsonParser, function (req, res) {
  var name = req.body.name
  if(!name) {
    res.send({'status':0, "message":"please provide your name"})
  }
  req.db.collection("candidates").insertOne(req.body, function(err, res) {
    if (err) throw err;
    res.send({'status':1, "message":"Candidate is Successfully Created"})
  });
  })

  app.post('/asign_score', jsonParser, function (req, res) { 
    req.db.collection("test_score").insertOne(req.body, function(err, result) {
      if (err) throw err;
      console.log("1 document inserted");
      res.send({"message":"Successfully Done"})
    });
    })

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
    
  