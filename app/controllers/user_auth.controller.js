const config = require("../config/auth.config");
const helper = require("../helper/helper");
const db = require("../models");
const User = db.user;
const Role = db.role;
const User_Otp = db.user_otp;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ errMsg: "Name, Email, Password: all required" });
    }
    const user = await new User({
      name: name,
      email: email,
      password: bcrypt.hashSync(password, 8),
    });
    await user.save();
    if (req.body.roles) {
      const roles = await Role.find({ name: { $in: req.body.roles } });
      user.roles = await roles.map((role) => role._id);
      await user.save();
      res.send({ msg: "User was registered successfully!" });
    } else {
      const role = await Role.findOne({ name: "user" });
      user.roles = [role._id];
      await user.save();
      res.send({ msg: "User was registered successfully!" });
    }
  } catch (error) {
    console.log("errr---", error);
    res.status(500).send({ message: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ errMsg: "Email, Password: all required" });
    }

    const getUser = await User.findOne({
      email: email,
    });
    if (!getUser) {
      return res.status(404).send({ errMsg: "Email Not found." });
    }
    const passwordIsValid = await bcrypt.compareSync(
      password,
      getUser.password
    );
    if (!passwordIsValid) {
      return res.status(401).send({
        errMsg: "Invalid Password!",
      });
    }
    const otp_code = await helper.generateOTP();
    const user_otp = await new User_Otp({
      user_id: getUser._id,
      otp: otp_code,
    });
    const save_otp = await user_otp.save();
    if (save_otp) {
      setTimeout(async () => {
        await User_Otp.findByIdAndDelete(user_otp._id);
      }, 60000);
    }
    return res
      .status(200)
      .send({ msg: "OTP sent", opt: otp_code, user_id: getUser._id });
  } catch (error) {
    console.log("errr---", error);
    res.status(500).send({ message: error.message });
  }
};

exports.verify_otp = async (req, res) => {
  const { user_id, otp } = req.body;
  if (!user_id || !otp) {
    return res.status(400).json({ msg: "user, otp: all required" });
  }
  const user_otp = await User_Otp.findOne({
    user_id: user_id,
  });
  if (!user_otp) {
    return res.status(401).send({ msg: "OTP expired" });
  }
  const checkOtp = user_otp.otp == otp;
  if (checkOtp) {
    const user = await User.findOne({ _id: user_id });
    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400,
    });
    setTimeout(async () => {
      await User_Otp.findByIdAndDelete(user_otp._id);
    }, 500);
    res.status(200).send({
      id: user._id,
      name: user.name,
      email: user.email,
      accessToken: token,
    });
  }
  if (!checkOtp) {
    return res.status(401).send({ message: "OTP don't match" });
  }
};
