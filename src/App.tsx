import { useState } from 'react';
import './App.less';
import Markdown from './components/markdown/Markdown';
import { initMathJax } from './components/markdown/MathJax';

function App() {
  const [r, setR] = useState('');
  const getInfo = (file: any) => {
    const a = new FileReader();
    a.onload = (event) => { // 设置读取成功以后执行的方法
      // @ts-ignore
      setR(event.target.result);
    };
    a.readAsText(file);
  };
  initMathJax();
  return (
    <div className="App">
      <input type="file" onChange={(e: any) => { getInfo(e.target.files[0]); }}></input>
      <Markdown mdText={r} />
    </div>
  );
}

export default App;
