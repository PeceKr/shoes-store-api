import Express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as http from "http";
import * as os from "os";
import mongoose from "mongoose";
import error from "../middleware/errors";
import config from "config";
import winston from "winston";
import "winston-mongodb";

export default class ExpressServer {
  constructor(app) {
    const root = path.normalize(`${__dirname}/../..`);
    this.app = app;
    this.app.set("appPath", `${root}client`);
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(Express.static(`${root}/public`));
    this.initDatabase();
    winston.add(new winston.transports.File({ filename: 'logfile.log' }));
    winston.add(new winston.transports.MongoDB({db:config.get('MongoDB.url')}));
  }

  router(routes) {
    routes(this.app); 
    return this;
  }

  listen(port = process.env.PORT) {
    console.log(
      `up and running in ${process.env.NODE_ENV ||
        "development"} @: ${os.hostname()} on port: ${port}}`
    );
    http.createServer(this.app).listen(port);
    return this.app;
  }

  initDatabase() {
    mongoose
      .connect(config.get("MongoDB.url"), {
        useCreateIndex: true,
        useNewUrlParser: true
      })
      .then(console.log("Connected to mongodb ..."))
      .catch(err => console.error("Could not connect to mongo db", err));
    mongoose.set("useFindAndModify", false);
  }
}
