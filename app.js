const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Student = require("./models/student"); // 連結到 student.js 運用他的模組
const methodOverride = require("method-override"); // 連結到 做資料修改要用的 一個模組

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // 幫助我們處理不同格式的請求資料 解析 JSON
app.use(methodOverride("_method")); // 把修改得模組寫進去他的使用連結 就可以做覆寫的動作
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://127.0.0.1:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to mongoDB.");
  })
  .catch((e) => {
    console.log("Connection failed.");
    console.log(e);
  });

app.get("/", (req, res) => {
  res.send("This is homepage.");
});
///////////////////////

// 做一個連結到 students 頁面 獲取 ejs 再來如果再以下 students 發生問題怎麼辦 用 try
app.get("/students", async (req, res) => {
  try {
    let data = await Student.find(); // 放進去資料會顯示這個首頁
    res.render("students.ejs", { data }); // 把找到 所有的 data 放進去 data 裡面就有找到所有學生
  } catch {
    res.send("Error with finding data.");
  }
});

///////////////////////

// 新增加一個頁面 在裡面要有一個 html 的 form 網頁初始  就可以新增學生進來 全部的學生
app.get("/students/insert", (req, res) => {
  res.render("studentInsert.ejs"); // 在 view 裡面新增這個 studentInsert.ejs
});

// 幫學生建立個人頁面

app.get("/students/:id", async (req, res) => {
  let { id } = req.params;
  try {
    // 再來我們在 database 要找到 有這個 id 的學生
    let data = await Student.findOne({ id }); // 回傳唯一的物件
    // 處理隨便輸入回傳錯誤資料頁面的樣子
    if (data !== null) {
      // 在 views 裡面新增一個 studentPag.ejs
      res.render("studentPage.ejs", { data }); // 如果找到 data 就來到  studentPag.ejs 做設定 標題為名字
    } else {
      res.render("Cannot find this student. Please enter a valid id."); // 沒有這個資料就會顯示
    }
  } catch (e) {
    res.send("Error!!"); // 就算有上面這個 程式碼還是有留著的必要性 因為上面有錯 還是會跳到這個 Error!!
    console.log(e);
  }

  //console.log(req.params); // 測試顯示可以拿到 :id
  //res.send("hello");  // 測試顯示可以拿到 :id
});

/////////////////////
/////////////////////

// 再來看能不能把 students.ejs 的頁面顯示出來 在 views 裡面創建 students.ejs

/////////////////////
// http://localhost:3000/students/insert 網址連到這就會出現設定的 tabel
// 連結運用到  studentInsert.ejs get 產生一個 html form 可以新增學生 post 會把 data 放到 mongoDB裡面 在檔案裏面創建列表
app.post("/students/insert", (req, res) => {
  // 得知下面可以的話 可以變成這樣寫
  // 靠 html form 可以新增資料的方式
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student accepted.");
      // 如果成功的話 就 render 到這個 accept.ejs 頁面
      res.render("accept.ejs");
    })
    .catch((e) => {
      console.log("Student not accepted.");
      console.log(e);
      res.render("reject.ejs");
      // 如果失敗的話 就 render 到這個 reject.ejs 頁面
    });
  //console.log(req.body); // 來看一下這個 form 回傳給我們的是甚麼 出現在命令提示自元
  //res.send("thanks for posting."); // 這個成功他就會把網站輸入的資料傳入  { id: '100', name: 'jie jing', age: '25', merit: '1500', other: '0' }
});

//////////////////////////////
//////////////////////////////

// 寫一個學生可以修改資料的頁面

app.get("/students/edit/:id", async (req, res) => {
  let { id } = req.params; // 當有這個 id 的時候要把它拿來用 順帶創建 edit.ejs
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("edit.ejs", { data }); // 放入這個 data 的目的 是因為 edit.ejs 會需要使用他
    } else {
      res.send("Cannot find student.");
    }
  } catch {
    res.render("Error!");
  }
});

// 再來我們要給他一個 put request 要怎麼讓他得到 get post 要借助一個 npm 叫做  method override npm 去下載模組 網址: https://www.npmjs.com/package/method-override
// 再到 cmd npm install method-override 下載好後 網址會教你怎麼用
// 在網站打 findoneandupdate mongoose 去找這個 api 怎麼用 網址 https://mongoosejs.com/docs/api/model.html#Model.findOneAndUpdate()

app.put("/students/edit/:id", async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      {
        new: true,
        runValidators: true,
      }
    );
    res.redirect(`/students/${id}`); // 更改完重新導向這個頁面的 id  redirect 用戶重定向到另一個 URL
  } catch {
    res.render("reject.ejs"); // 導入一個 錯誤的話就顯示這個程式檔的頁面
  }
});

////////////////////////////////

//////////////////////////////
// 刪除資料頁面與方式 用 postman 的方式 先用 cmd 打開檔案 node app.js 到 postman 左邊有個 下拉式選單 選到 DELETE 輸入 localhost:3000/students/delete/100 然後 右邊按鈕 Send 然後下面會顯示成功 Deleted successfully.
// 使用以上方式 Send 就成功把上面的 ID 100 頁面 移除了
app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id })
    .then((meg) => {
      console.log(meg);
      res.send("Deleted successfully.");
    })
    .catch((e) => {
      console.log(e);
      res.send("Delete failed.");
    });
});

///////////////////////////////
// 再來有人亂打資料一通的話 設定為不能亂打一通

app.get("/*", (req, res) => {
  res.status(404);
  res.send("Not allowed.");
});

/////////////////////////
////////////////////////////

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});

// localhost:3000 為網址
// 記得一個重點 如果 mongoDB 報錯沒有連結服務的話 請到 命令提示字元右鍵管理者身分 輸入代碼 net start MongoDB
