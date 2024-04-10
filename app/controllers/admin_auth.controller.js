const config = require("../config/auth.config");
const helper = require("../helper/helper");
const db = require("../models");
const Admin = db.admin;
const Role = db.role;
const Admin_Otp = db.admin_otp;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ msg: "name, email, password: all required" });
    }
    const admin = await new Admin({
      name: name,
      email: email,
      password: bcrypt.hashSync(password, 8),
    });
    await admin.save();
    if (req.body.roles) {
      const roles = await Role.find({ name: { $in: req.body.roles } });
      admin.roles = await roles.map((role) => role._id);
      await admin.save();
      console.log(4);
      res.send({ message: "Admin was registered successfully!" });
    } else {
      const role = await Role.findOne({ name: "admin" });
      admin.roles = [role._id];
      await admin.save();
      res.send({ message: "Admin was registered successfully!" });
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
      return res.status(400).json({ msg: "email, password: all required" });
    }

    const getAdmin = await Admin.findOne({
      email: email,
    });
    if (!getAdmin) {
      return res.status(404).send({ message: "Email Not found." });
    }
    const passwordIsValid = await bcrypt.compareSync(
      password,
      getAdmin.password
    );
    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Invalid Password!",
      });
    }
    const otp_code = await helper.generateOTP();
    const admin_otp = await new Admin_Otp({
      admin_id: getAdmin._id,
      otp: otp_code,
    });
    const save_otp = await admin_otp.save();
    if (save_otp) {
      setTimeout(async () => {
        await Admin_Otp.findByIdAndDelete(admin_otp._id);
      }, 60000);
    }
    return res
      .status(200)
      .send({ message: "OTP sent", otp: otp_code, admin_id: getAdmin._id });
  } catch (error) {
    console.log("errr---", error);
    res.status(500).send({ message: error.message });
  }
};

exports.verify_otp = async (req, res) => {
  const { admin_id, otp } = req.body;
  if (!admin_id || !otp) {
    return res.status(400).json({ msg: "admin, otp: all required" });
  }
  const admin_otp = await Admin_Otp.findOne({
    admin_id: admin_id,
  });
  if (!admin_otp) {
    return res.status(401).send({ message: "OTP expired" });
  }
  const checkOtp = admin_otp.otp == otp;
  if (checkOtp) {
    const admin = await Admin.findOne({ _id: admin_id });
    var token = jwt.sign({ id: admin.id }, config.secret, {
      expiresIn: 86400,
    });
    setTimeout(async () => {
      await Admin_Otp.findByIdAndDelete(admin_otp._id);
    }, 500);
    res.status(200).send({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      accessToken: token,
    });
  }
  if (!checkOtp) {
    return res.status(401).send({ message: "OTP don't match" });
  }
};
