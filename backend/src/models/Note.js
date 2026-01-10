import mongoose from "mongoose";


//create a schema 也就是定义数据结构
// create a model based on the schema  也就是将数据结构映射到数据库中
//Schema 是mongoose中定义数据结构的类 两个参数 第一个参数是集合名 第二个参数是集合的结构
const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
    },
    ownerId: {
        type: String, required: true, index: true
    },
    ownerType: {
        type: String, required: true, enum: ['user', 'guest'], index: true  
    },
    expiresAt: {type: Date, default: null}  //default null means no expiration 
},
{timestamps: true}
);

//guest data expires automatically 
noteSchema.index({ expiresAt: 1 }, {expiresAfterSeconds: 0});  //设置TTL（time to live）索引 过期时间到达0秒后自动删除文档  1表示升序 从最早到最新 这个不影响过期时间 只影响索引的存储顺序

const Note = mongoose.model("Note", noteSchema);

export default Note;

// 1.schema 是图纸 但不能直接使用 只是规则
// mongoose.Schema 接收两个主要的参数（对象）：
// 第一个参数：字段定义 (Field Definitions)它定义了数据的“形状”。
//     type: 规定数据的类型（String, Number, Date, Boolean 等）。
//     required: 验证规则。如果存数据时没写 title，数据库会拒绝保存并报错。
// 第二个参数：选项 (Options)也就是你写的 { timestamps: true }。
//  作用：它会自动给你的每一条数据加上两个字段：createdAt（创建时间）和 updatedAt（最后修改时间）。你不需要手动去写获取当前时间的逻辑，Mongoose 帮你做了。
// noteSchema 是一个由 mongoose.Schema 构造函数创建的实例

// 2.model 是一个构造函数 只有通过他才能在代码调用db的操作方法 比如save find delete等
// model第一个参数是模型名 相当于mongodb中的身份证 根据他创建“表”的名字Note->notes User->users 之后可用于关联不同model
//第二个参数是shcema对象也就是图纸 告诉模型数据长什么样 
// 调用model后得到的Note是一个构造函数 会在mongoDB中自动创建一个复数形式+全小写的集合名第notes
//在 JavaScript 中，当你看到一个变量首字母大写（如 Note），并且你可以用 new 关键字去创建一个新实例时，它就是一个构造函数（或者是类 Class）。