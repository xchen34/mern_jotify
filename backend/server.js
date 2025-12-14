//引入Express.js模块 这里使用ES模块导入 需要在package.json中添加"type":"module"
import express from "express";
//等同与const express = require('express'); require("express")是node.js语法 用于倒入express模块
// const express 将倒入的模块赋值给express变量 是个框架的顶级函数，用于创建一个express应用


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


//启动服务 app.listen(PORT, CALLBACK) 比如 app.listen(3000, () => console.log("Server started on port 3000"));
//PORT是端口号，如3000 
//CALLBACK是回调函数，当服务器启动时，会执行这个回调函数

//设置配置 使用app.set(KEY, VALUE)来设置配置 KEY是配置项，VALUE是配置值 比如app.set("port", 3000);

//第二个参数是回调函数，当服务器启动时，会执行这个回调函数 函数有两个参数，
// req是客户端发来的请求对象，包含了请求的所有信息（例如请求头，查询参数等）第二个参数是响应对象
// res是服务器要发回的相应对象 用于发送数据或状态码给客户端
app.get("/api/notes", (req,res) => {
    res.status(200).send("you got 10 notes");
});

// app.get("/api/notes", function(req, res)
// {
//     app.status(200).send("you got 10 notes")
// });


app.put(/api/notes/, function(req,res){
    res.putfsdfsfdsfdsf
});

app.put(/api/notes, (req, res)=>{
    res.sfdksfjdksjfdkjfk

});


//listen() method is used to bind and listen the connections on the specified host and port, console.log() is used to print the message on the console once the server starts
//启动 服务器，并监听指定的端口，当服务器启动时，会在控制台打印出一条消息
//第二个参数是回调函数，当服务器启动时，会执行这个回调函数 这个函数不需要任何参数所以是空括号
app.listen(5001, ()=> {
    console.log("Server started on port 5001")  
});
// app.listen(5001, function(){
//     console.log("Server started on port 5001")
// });








//notes 
// node -v 查看是否安装node
// 在后端目录下 npm init -y  初始化nodeJS应用 会创建一个package.json文件 
// npm install express@4.18.2 用node安装express npm是node的包管理器
// node server.js 运行server.js文件  也可以 npm run <key> 这里是'dev'
// npm run xxx 里的 xxx 必须和 pacakage.json里面scripts 里的 key 一模一样。 value就是执行的命令 这里是 'node server.js' 下次执行 npm run dev 就会自动执行 node server.js
//github 配置传，依赖不传；规则传，秘密不传。



//status code   1xx informational   2xx success(200 ok, 201 Created)  3xx redirection(300 rediction, 301 moved permanently.change from http to https)  
// 4xx client error (400 bad request, 404 not found, 401 unauthorized, 403 forbidden, 429 too many requests)  
// 5xx server error (500 internal server error, 503 service unavailable
