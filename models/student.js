const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  id: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  age: {
    type: Number,
    default: 18,
    max: [80, "Too old in this school"],
  },
  scholarship: {
    merit: {
      type: Number,
      min: 0,
      max: [5000, "Too much merit scholarship"],
    },
    other: {
      type: Number,
      min: 0,
    },
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student; // exports 唯一的物件

// 再回到 app.js 連結這個物件
// const Student = require("./models/student");
// 以上程式碼為連結方式
