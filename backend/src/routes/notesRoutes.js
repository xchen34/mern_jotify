import express from "express";
import {getAllNotes, getNoteById, createNote, updateNote, deleteNote} from '../controllers/notesControllers.js'

import { requireAuth} from "../middleware/authMiddleware.js";
     

//Router()创建一个新的路由对象 是 Express.js 提供的一个功能，允许你创建模块化、可挂载的路由处理器。
const router = express.Router();


router.use(requireAuth);  //在所有路由中间件中使用身份验证中间件


//controllers文件夹下的文件可以专门用来写路由的回调函数 即处理请求的逻辑单独抽离到controllers
//是一种标准架构
//控制器的角色 
// 在MVC（Model-View-Controller，模型-视图-控制器）或类似的分层架构中：
// routes/   路由层    定义URL和HTTP方法 负责将特定URL请求分发给正确的控制器函数
// controllers/   控制层    处理业务逻辑 接收路由传递的req，执行核心逻辑（比如调用模型 处理数据）并决定发送什么响应
// models/  模型曾  数据层交互 负责月db进行读写操作  

// router.get("/", (req, res) => {
//     res.status(200).send("大岛优子和我结婚");
// });

// router.post("/", (req, res)=> {
//     res.status(201).json({message: "Created:大岛优子和我结婚"})
// });

// router.put("/:id", (req, res) => {
//     res.status(200).json({message:"Updated:大岛优子和我结婚"})
// });


// router.delete("/:id", (req, res) => {
//     res.status(200).json({message:"Deleted:大岛优子和我结婚"})
// });


//不能这样写router.get("/", getAllNotes(req, res)); 因为她会导致回调函数立即执行 而不是等请求到了才执行
router.get("/", getAllNotes);
router.get("/:id", getNoteById); //注意这里的:id 是一个动态参数 表示笔记的唯一标识符ID 当客户端请求 /api/notes/123 时，123 会被解析为 id 参数的值，可以通过 req.params.id 访问它
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

//它的作用是将当前文件中的 router 变量（即 Express 路由实例）设置为该模块的唯一或主要导出内容，以便其他文件可以导入和使用它
export default router; //默认 (Default) 导出意味着：当其他文件导入时，他们可以随意命名导入的变量。
//例如：import notesRouter from "./routes/notesRoutes.js"; 导入后变量名为notesRouter 
//无论名字是什么 他们引用的都是notesRouter.js中export default router; 导出的那个router实例
