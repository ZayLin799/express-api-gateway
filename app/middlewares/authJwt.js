const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const Admin = db.admin;
const User = db.user;

verifyToken = (req, res, next) => {
  let authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).send({ errMsg: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ errMsg: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  Admin.findById(req.userId).exec((err, admin) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (admin) {
      next();
      return;
    } else {
      return res.status(401).send({ message: "Authorized only for admin!" });
    }
  });
};

isUser = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ errMsg: err });
      return;
    }
    if (user) {
      next();
      return;
    } else {
      return res.status(401).send({ errMsg: "Authorized only for user!" });
    }
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isUser,
};
module.exports = authJwt;
