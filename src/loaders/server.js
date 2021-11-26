const cors = require("cors"),
  https = require('https'),
  http = require('http'),
  fs = require('fs'),
  path = require('path'),
  express = require("express"),
  app = express()

module.exports = async () => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  require('../api/v1')(app)



  let server = null

  // server = https
  //   .createServer(
  //     {
  //       key: fs.readFileSync(path.join(__basedir, "../server.key")),
  //       cert: fs.readFileSync(path.join(__basedir, "../server.cert")),
  //     },
  //     app
  //   )

  server = http.createServer(app)

  server.listen(config.port, (err) => {
    if (err) return console.log(err);
    console.log(`Server is running on port ${config.port}!`);
  });

  return server;
};
