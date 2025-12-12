import express from "express";

// express() creates an instance of an express application 
const app = express();  

app.get("/api/notes", (req,res) => {
    res.status(200).send("you got 10 notes");
});

//listen() method is used to bind and listen the connections on the specified host and port, console.log() is used to print the message on the console once the server starts
app.listen(5001, ()=> {
    console.log("Server started on port 5001")  
});








//notes 
// 1, npm run xxx 里的 xxx 必须和 pacakage.json里面scripts 里的 key 一模一样。
//2.github 配置传，依赖不传；规则传，秘密不传。