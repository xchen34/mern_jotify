import { Route, Routes } from 'react-router-dom';

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";
import EntryPage from "./pages/EntryPage";
import toast from "react-hot-toast";


const App = () => {
  return (
    <div className="relative h-full w-full">
      {/* <button className="btn">Default</button>
      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-secondary">Secondary</button>
      <button className="btn  btn-accent">Accent</button>
      <button className="btn btn-neutral">Neutral</button>
       <button className="btn btn-ghost">Ghost</button>
        <button className="btn btn-link">Link</button> */}
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradien
        (125%_125%_at_50%_10%,#000-60%m#000FF9D40_100%)]" />
      <Routes>
        <Route path="/login" element={<EntryPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/note/:id" element={<NoteDetailPage />} />
      </Routes>

    </div>
  );
};

export default App













// 是一个非常高效的工具。rafce 是 ES7+ React/Redux/React-Native Snippets 扩展提供的“快捷口令”（代码片段）。

// 它的全称是：React Arrow Function Component Export（React 箭头函数组件导出）。

// 当你输入这五个字母并按回车时，VS Code 会自动帮你把一个 React 组件的“骨架”搭好，省去你手动敲重复代码的时间。
// 这段代码每一行的意思：

//     import React from 'react'

//         意思：从 react 库中引入核心功能。

//         注意：在 React 17 版本之后，这行其实可以省略了，但 Snippet 插件默认还是会带上它，以保证兼容性。

//     const App = () => { ... }

//         意思：定义一个名为 App 的 箭头函数。

//         原理：在现代 React 中，组件本质上就是一个返回 HTML（准确说是 JSX）的函数。箭头函数比传统的 function 关键字更简洁。

//     return ( <div>App</div> )

//         意思：这个组件被渲染到屏幕上时，长什么样子。

//         语法：这里写的是 JSX。它看起来像 HTML，但实际上是 JavaScript 的扩展，允许你在 JS 里直接写标签。

//     export default App

//         意思：把这个组件“打包”导出。

//         作用：这样你在其他文件（比如 main.jsx）里，才能通过 import App from './App' 来使用它。