const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const Nexmo = require('nexmo');


app.use(bodyParser.json()); // for parsing POST req
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('views', __dirname + '/views'); // Render on browser
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.use(express.static(__dirname + '/views'));

// Define port
const port = 5000;

// Start server
const server = app.listen(port, () => console.log(`Server started on port ${port}`));

const nexmo = new Nexmo({
    apiKey: 'afda69f5',
    apiSecret: 'NnpF0fG5rW2YPGXz'
  }, { debug: true });

// Web UI ("Registration Form")
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/register', (req, res) => {
  // A user registers with a mobile phone number
  let phoneNumber = req.body.number;
  console.log(phoneNumber);
  nexmo.verify.request({
    number: phoneNumber,
    brand: 'ManjuNodeAPI'
  }, (err, result) => {
    if (err) {
      //res.sendStatus(500);
      res.render('status', {
        message: 'Server Error'
      });
    } else {
      console.log(result);
      let requestId = result.request_id;
      if (result.status == '0') {
        res.render('verify', {
          requestId: requestId
        });
      } else {
        //res.status(401).send(result.error_text);
        res.render('status', {
          message: result.error_text,
          requestId: requestId
        });
      }
    }
  });
});

app.post('/verify', (req, res) => {
  // Checking to see if the code matches
  let pin = req.body.pin;
  let requestId = req.body.requestId;

  nexmo.verify.check({
    request_id: requestId,
    code: pin
  }, (err, result) => {
    if (err) {
      //res.status(500).send(err);
      res.render('status', {
        message: 'Server Error'
      });
    } else {
      console.log(result);
      // Error status code: https://developer.nexmo.com/api/verify#verify-check
      if (result && result.status == '0') {
        //res.status(200).send('Account verified!');
        res.render('status', {
          message: 'Account verified! 🎉'
        });
      } else {
        //res.status(401).send(result.error_text);
        res.render('status', {
          message: result.error_text,
          requestId: requestId
        });
      }
    }
  });
});