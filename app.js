const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const userRouter = require("./routes/user.route");
const emailRouter = require("./routes/email.route");
// const nodeCron = require("node-cron");
const app = express();
const port = process.env.PORT;
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(userRouter);
app.use(emailRouter)

// //update subscription and send email
// nodeCron.schedule("0 0 * * *", async function () {
//   UpdateSubscription();
// });

// //testing run this fun every 2 seconds
// nodeCron.schedule(" */5 * * * * *", async function () {
//   console.log("hii");
// });

app.listen(port, () => {
  console.log(`Server Connected Successfully at ${port}`);
});
