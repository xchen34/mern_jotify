//引入Express.js模块 这里使用ES模块导入 需要在package.json中添加"type":"module"
import express from "express";
//等同与const express = require('express'); require("express")是node.js语法 用于倒入express模块
// const express 将倒入的模块赋值给express变量 是个框架的顶级函数，用于创建一个express应用

//引入路由模块实例 赋值给变量notesRoutes 
import notesRoutes from "./routes/notesRoutes.js"

import rateLimiter from "./middleware/rateLimiter.js";

//在 ES Modules (JS 模块) 中，默认导出 (Default) 和 命名导出 (Named) 是两套不同的路标：
// 加在结尾的export default X：像是一个房间只有一个大门，你进来直接就能带走 X。导入时写 import X from ...。
// 加在定义前面的export const X：像是房间里有很多小盒子，你必须指名道姓要拿哪个盒子。导入时写 import { X } from ...。
import {connectDB} from "./config/db.js"


import dotenv from "dotenv"

dotenv.config(); //加载.env文件中的环境变量


// express() creates an instance of an express application 
const app = express();  //执行上面创建的express函数，返回一个express应用程序对象(app object)，通常命名为app
//这个app就是我整个web应用的本体。所有服务器功能，配置，路由都通过这个app对象来设置
//定义路由 使用app.HTTP_METHOD(PATH, HANDLER)来定义路由
//HTTP_METHOD是HTTP请求方法，如GET，POST，PUT，DELETE等
//PATH是URL路径，如“/api/notes”
//HANDLER是处理请求的函数，当请求到达时，会执行这个函数  比如 app.get("/api/notes", (req, res) => res.send("Hello World!"));

// 添加中间件 使用app.use()  想象一下您是一个客户端请求（Request），正准备登机（到达最终路由）。您必须通过一系列检查站
// （中间件）才能到达目的地。这些检查站可以检查您的身份（身份验证），您的行李（验证），甚至可以为您准备一些东西（如压缩响应）。
// 经典的中间件应用场景： 解析客户端发送的 JSON 或表单数据，并将其放入 req.body。 express.json() 和 express.urlencoded() 是内置的中间件，用于解析 JSON 和表单数据。
// 检查用户是否已登录或是否有权访问特定资源。	如果未登录，直接返回 res.status(401).send('Unauthorized')
// app.use() 就是用来将一个中间件“安装”到 Express 应用流水线中的方法。
// 语法结构 app.use([path], callback) path可选 制定中间件生效的路径前缀 如果省略则对所有请求生效 默认'/'  callback函数（中间件函数）必须
// middleware(req,res,next)=?{函数体}
//req,res,next是三个参数，req是请求对象，res是响应对象，next是下一个中间件函数。next是一个函数，调用next()表示将控制权交给下一个中间件函数。
//如果不调用next()且没有发送响应，则请求将被挂起，直到超时。
//有些函数会自动调用next()，比如路由处理函数. express.json，有些函数不会，比如错误处理函数。
//request in ---> middleware1 ---> middleware2 ---> route handler(app.get(path,...))执行业务逻辑 ---> response out（res.send()）
// Middleware is a function that runs in the middle between request and response 

//启动服务 app.listen(PORT, CALLBACK) 比如 app.listen(3000, () => console.log("Server started on port 3000"));
//PORT是端口号，如3000 
//CALLBACK是回调函数，当服务器启动时，会执行这个回调函数

//设置配置 使用app.set(KEY, VALUE)来设置配置 KEY是配置项，VALUE是配置值 比如app.set("port", 3000);

const PORT = process.env.PORT || 5001; //process.env.PORT 是环境变量，如果环境变量中没有设置PORT，则使用默认值5001
connectDB().then(() => {
    app.listen(PORT,() => {
        console.log("Server started on PORT:", PORT);
    });
});
//middleware 
// 简单来说，app.use(express.json()) 是一个内置的中间件，它的作用是让你的 Express 服务器能够读懂客户端发送过来的 JSON 数据。
// 如果不写这一行，当你通过 Postman 或前端发送一个 POST 请求（带 JSON Body）时，后端代码里的 req.body 将会是 undefined。
// 🔍 为什么需要它？（原理拆解）
//     数据的本质：当你在 Postman 的 Body 中选择 raw -> JSON 发送数据时，数据是以“字符串”的形式在网络上传输的。
//     解析过程：express.json() 会监听进入服务器的请求。如果它发现请求头里的 Content-Type 是 application/json，它就会：
//         拦截这个请求。
//         把那一串 JSON 字符串“翻译”回 JavaScript 对象。
//         把它挂载到 req.body 上，供你后续使用。
app.use(express.json());  //this middleware will parse json bodies to allow acces to them in req.body

app.use(rateLimiter);
//other simple customized middleware
// app.use((req,res,next)=>{
//     console.log(`Request method is ${req.method} and Request URL is ${req.url}`);   //有变量需要用反引号 在数字1的旁边
//     next();
// })


//express.js路由有两种组织方式
//1. 直接使用express实例的顶级对象app来写 app.get()、app.post()等方法来定义路由
//2. 使用express.Router()来创建一个路由对象，然后使用该对象来定义路由 模块化陆由modular routing模式
//通过app.use()将router实例作为一个中间件挂在到app实例上，这样就可以在app实例上使用router实例定义的路由了


//方法1
//第二个参数是回调函数，当服务器启动时，会执行这个回调函数 函数有两个参数，
// req是客户端发来的请求对象，包含了请求的所有信息（例如请求头，查询参数等）第二个参数是响应对象
// res是服务器要发回的相应对象 用于发送数据或状态码给客户端
// app.get("/api/notes", (req,res) => {
//     res.status(200).send("大岛优子和我结婚");
// });

// app.get("/api/notes", function(req, res)
// {
//     app.status(200).send("you got 10 notes")
// });

//endpoint is a combinaison of a url + http method that lets the client interact with a specific resource on the server. 

// app.post("/api/notes", (req, res)=>{
//     res.status(201).json({message:"Note created successfully!"})

// });

// app.put("/api/notes/", function(req,res){
//     res.status(200).json({message:"Note updated successfully!"})
// });

//方法2   use方法用来挂载中间件函数 两个参数 当客户端请求的url与中间件函数的路径匹配时，中间件函数会被执行
app.use("/api/notes", notesRoutes);  
//notesRoutes 是什么？ 它是从 notesRoutes.js 文件中导入的一个 router 实例（一个路由中间件）
//Express 会将 notesRoutes 模块中定义的所有路由路径，都自动加上 /api/notes 这个前缀
// app.use("/api/product", productRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/auth", authRoutes);


//listen() method is used to bind and listen the connections on the specified host and port, console.log() is used to print the message on the console once the server starts
//启动 服务器，并监听指定的端口，当服务器启动时，会在控制台打印出一条消息
//第二个参数是回调函数，当服务器启动时，会执行这个回调函数 这个函数不需要任何参数所以是空括号
// app.listen(PORT, ()=> {
//     console.log("Server started on port", PORT);
// });

// app.listen(5001, function(){
//     console.log("Server started on port 5001")
// });



//mongodb+srv://leochen:<db_password>@cluster0.7zqa0uq.mongodb.net/?appName=Cluster0




//notes 
// node -v 查看是否安装node
// 在后端目录下 npm init -y  初始化nodeJS应用 会创建一个package.json文件 
// npm install express@4.18.2 用node安装express npm是node的包管理器
// node server.js 运行server.js文件  也可以 npm run <key> 这里是'dev'
// npm run xxx 里的 xxx 必须和 pacakage.json里面scripts 里的 key 一模一样。 value就是执行的命令 这里是 'node server.js' 下次执行 npm run dev 就会自动执行 node server.js
//github 配置传，依赖不传；规则传，秘密不传。
//npm install nodemon -D 安装nodemon  -D 是 --save-dev 的简写，表示这个包是开发依赖，只在开发环境中使用，不会在生产环境中使用
//使用nodemon启动服务器，当文件发生变化时，会自动重启服务器 大大提高了开发效率 需要在script 里面改dev的命令为 nodemon server.js
//npm install mongoose@7.0.3 用于更简单规范地操作mongodb 连接node.js和mongodb的桥梁
//npm install dotenv   用于加载.env文件中的环境变量
// 下载postman并运行 用于测试api  在mongodb atlas里面可以看到当前的数据
//npm i @upstash/ratelimit@2.0.5 @upstash/redis@1.34.9 
//mode.js版本太低导致upstash fetch报错，因为低版本没有内置fetch  可以升级或者安装fetch  npm install node-fetch
//然后在ratelimit.js 引入fetch 

//status code   1xx informational   2xx success(200 ok, 201 Created)  3xx redirection(300 rediction, 301 moved permanently.change from http to https)  
// 4xx client error (400 bad request, 404 not found, 401 unauthorized, 403 forbidden, 429 too many requests)  
// 5xx server error (500 internal server error, 503 service unavailable


// rate limit限制请求频率，防止恶意攻击，防止服务器压力过大 ex: only 100 req per user eveyr 15min
// prevent abuse, protec server from getting overwhelmed   429 too many requests
