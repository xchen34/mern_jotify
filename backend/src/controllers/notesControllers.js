
import mongoose from "mongoose";   //用于检查ID的有效性
import Note from "../models/Note.js"

//比原始版本增加了功能 支持多用户 每个用户只能访问自己的笔记 user+guest（visitor mode）
//ownerFilter函数根据请求对象中的认证信息，构建一个过滤器对象，用于确保数据库查询只返回属于当前认证用户的笔记。
//所有的Note查询/修改 都必须加上owner条件 ownerId = req.auth.id  ownerType=req.auth.type
//并且create的时候写入owner(guest还要可选加expiresAt)

const ownerFilter = (req) => {
    return { ownerId: req.auth.id, ownerType: req.auth.type};
}

// 在这个文件中，req 和 res 仅仅是函数的形参 (formal parameters)。
// 它们的名字是约定俗成的，代表了“请求”和“响应”，但它们本身并没有在文件中被定义或导入。
// Express 内部的工作机制 (调用时机)

// 当一个请求到达服务器并匹配到 /api/notes 路径时：

//     Express 框架找到并识别了 router.get("/", getAllNotes) 这一行。

//     Express 框架在内部创建了包含所有请求信息的新 req 对象和包含响应方法的 res 对象。

//     Express 框架使用这些对象作为参数，调用了您的 getAllNotes 函数
// 需要导入 Express (如在 routes 文件中)： 是因为您需要使用 Express 提供的对象或方法，例如 express.Router() 或 express.json()。

//     不需要导入 Express (如在 controllers 文件中)： 是因为您在控制器中使用的 req 和 res 变量，并不是来自 Express 模块本身，而是 Express 框架在运行时动态创建并注入到您函数中的局部参数。

// 控制器文件的职责是纯粹的业务逻辑，它不需要知道自己是如何被调用的，也不需要直接使用 Express 的构建工具，只需要接收 req 和 res 参数来完成工作即可。

export async function getAllNotes(req, res){      //这里没有用到req 所以也可以用_代替req
    //res.status(200).send("欢迎参加大岛优子和我的婚礼");
    try
    {
        const notes = await Note.find(ownerFilter(req)).sort({createdAt: -1}); //find() 方法用于查询数据库中的所有文档，并返回一个包含所有匹配文档的数组。  sort({createdAt: -1}) 最近创建的排在最前面
        res.status(200).json(notes);
    }catch(error)
    {
        console.error("Error in getAllNotes controller鸭鸭鸭");
        res.status(500).json({message:"Internal server error鸭鸭鸭"});
    }
}

export async function  getNoteById(req, res){
    try{
        //防止恶意输入 非法ID导致服务器崩溃
        if (!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({message:"Invalid note ID鸭鸭鸭"});
        }
        
        //const note = await Note.findById(req.params.id);
        const note = await Note.findOne({_id: req.params.id, ...ownerFilter(req)}); //确保只能访问自己的笔记
        if (!note) return res.status(404).json({message:"Note not found鸭鸭鸭"});
        res.status(200).json(note);
    }catch (error){
        console.error("Error in getNoteById controller鸭鸭鸭");
        res.status(500).json({message:"Internal server error鸭鸭鸭"});
    }
}

//req.body 是一个包含请求体数据的对象。当客户端发送一个 POST 请求时，请求体数据通常包含在请求体中，例如表单数据或 JSON 数据。
//req.body={title:"xxx", content:"xxx"} 请求体数据 前提是使用了app.use(express.json())中间件
//{title,content} 解构赋值的写法 从body中提取title和content属性赋值给括号里的变量 {t,c}不是变量也不是对象  相当于
// const title= req.body.title; 
// const content=req.body.content;
//const {title, content} = req.body;  是一种解构赋值语法 object destructuring assignment  
export async function createNote(req, res){
    //res.status(201).json({message: "Created:欢迎参加大岛优子和我的婚礼"});
    try{
        const {title, content} = req.body;  
        
        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({message: "Title and content are required鸭鸭鸭"});
        }

        if (title.length > 100) {
            return res.status(400).json({message: "Title cannot exceed 100 characters鸭鸭鸭"});
        }

        if (content.length > 5000) {
            return res.status(400).json({message: "Content cannot exceed 5000 characters鸭鸭鸭"});
        }

        const expiresAt = req.auth.type === "guest"? new Date(Date.now() + 7*24*60*60*1000) : null; //访客模式下笔记7天后过期 
        
        
        
        const newNote = new Note({title:title.trim(), content:content.trim(), ownerId:req.auth.id, ownerType:req.auth.type, expiresAt});  //构造函数 参数取决与前面的模型 
        //创建“表里的一行数据”的内存对象（document），但此时还没有真正写入数据库。
        //在mongoose里  表=集合 collection  行=document
        
        //savedNote 是一个包含新创建的文档的内存对象（document），但此时已经真正写入数据库。
//   savedNote = {
    //              _id: "65f...",
    //              title: "xxx",
    //               content: "yyy",
//              __v: 0
//                  }

        const savedNote = await newNote.save(); //真正写入数据库 或使用await Note.create({title, content});创建并保存一步完成
        res.status(201).json(savedNote);  //json()方法将对象转换为JSON字符串，并将其作为响应体发送给客户端。
    }catch(error){
        console.error("Error in createNote controller鸭鸭鸭");
        res.status(500).json({message:"Internal server error鸭鸭鸭"});
    }
}

export async function updateNote(req, res){
    
    //res.status(200).json({message: "Updated:欢迎参加大岛优子和我的婚礼"});
    try{
        const {title, content} = req.body;
       
        if (!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({message:"Invalid note ID鸭鸭鸭"});
        }

        //const updatedNote = await Note.findByIdAndUpdate(req.params.id, {title, content},{new: true}) //new: true表示返回更新后的文档 不写则返回更新前的文档
        // 关键：加 ownerFilter，防止改到别人的 note
        const updatedNote = await Note.findOneAndUpdate(
        { _id: req.params.id, ...ownerFilter(req) },
        { title, content },
        { new: true }
    );
        
        if (!updatedNote) return res.status(404).json({message: "Note not found鸭鸭鸭"});
        res.status(200).json(updatedNote);
    }catch(error){
        console.error("Error in updateNote controller鸭鸭鸭");
        res.status(500).json({message:"Internal server error鸭鸭鸭"});
    }
}

export async function deleteNote(req, res){
    //res.status(200).json({message: "Deleted:欢迎参加大岛优子和我的婚礼"});
    try{
       if (!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({message:"Invalid note ID鸭鸭鸭"});
        }
       
        //const deletedNote = await Note.findByIdAndDelete(req.params.id);
        // 关键：加 ownerFilter，防止删到别人的 note
        const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, ...ownerFilter(req) });
        
        if (!deletedNote) return res.status(404).json({message: "Note not found鸭鸭鸭"});
        res.status(200).json({message:"delete with succusss鸭鸭鸭"});
    }catch(error){
        console.error("Error in deleteNote controller鸭鸭鸭");
        res.status(500).json({message:"Internal server error鸭鸭鸭"});
    }
}