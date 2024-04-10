const db = require("./../models");
const Role = db.role;

function generateOTP() {
  return Math.floor(Math.random() * 9000) + 1000;
}

function getTodayDate() {
  const today = new Date();
  const date = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  const dateTime = `${date} ${time}`;
  return dateTime;
}

async function setRole() {
  const query = Role.find({ name: "admin" });
  const count = await query.estimatedDocumentCount();
  if (count === 0) {
    new Role({
      name: "admin",
    }).save();
    new Role({
      name: "user",
    }).save();
  }
}

module.exports = {
  generateOTP,
  getTodayDate,
  setRole,
};
