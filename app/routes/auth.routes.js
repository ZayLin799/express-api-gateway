const { verifySignUp } = require("../middlewares");
const { authJwt } = require("../middlewares");

const adminController = require("../controllers/admin_auth.controller");
const userController = require("../controllers/user_auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //admin routes
  app.post(
    "/api/admin/auth/signup",
    [
      verifySignUp.checkDuplicateAdminNameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    adminController.signup
  );
  app.post("/api/admin/auth/signin", adminController.signin);
  app.post("/api/admin/auth/verify_otp", adminController.verify_otp);

  //user routes
  app.post(
    "/api/user/auth/signup",
    [
      verifySignUp.checkDuplicateUserNameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    userController.signup
  );
  app.post("/api/user/auth/signin", userController.signin);
  app.post("/api/user/auth/verify_otp", userController.verify_otp);

  app.get("/api/users", [authJwt.verifyToken, authJwt.isAdmin], (req, res) => {
    const userId = req.userId;
    res.status(200).send({
      msg: "Reach!",
      id: userId,
    });
  });
};
