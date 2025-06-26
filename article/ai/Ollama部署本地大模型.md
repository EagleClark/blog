# 前言

> 笔者本人PC的系统为windows 11，以下操作均是基于该系统。
>
> 电脑配置：CPU Intel i5 12600KF、内存 DDR5 32GB、显卡 NVIDIA GeForce RTX 4060 Ti 8GB。
>
> 部分内容由 AI 生成

# 简介

Ollama 本质就是开箱即用的大模型部署工具，我们可以利用他来部署各种大模型，操作简单方便。

Ollama 如同 Docker 将应用打包成“集装箱”，Ollama 将大型语言模型做成即插即用的**模型容器**。

同类型工具，如下表所示：

| 工具名称              | 核心优势               | 适用场景         | 是否开源 | 内存占用示例    |
| --------------------- | ---------------------- | ---------------- | -------- | --------------- |
| **Ollama**            | Docker化部署，一键启动 | 快速原型开发     | ✅        | 7B模型≈5GB      |
| LM Studio             | 开箱即用GUI界面        | 非技术用户体验   | ❌        | 7B模型≈6GB      |
| GPT4All               | CPU模式性能优化        | 老旧设备救星     | ✅        | 7B模型≈4GB      |
| text-generation-webui | 超强自定义插件系统     | 极客玩家的实验室 | ✅        | 取决于加载方式  |
| HuggingFace TGI       | 工业级推理性能         | 生产环境部署     | ✅        | 需要GPU显存支撑 |
| vLLM                  | Attention算法优化大师  | 学术研究基准测试 | ✅        | 极致显存优化    |

# Ollama 安装步骤

## Step 1： 环境变量配置

为了不装 C 盘，必须在安装 Ollama 之前配置好环境变量。

Windows 的 系统环境变量增加如下配置即可：

```sh
# 环境变量名称
OLLAMA_MODELS
# 环境变量值，就是路径按照自己的实际情况配置即可
D:\ollama
```

## Step 2：下载并安装

去 [Ollama 官网](https://ollama.com/) 直接下载与系统匹配的安装包。同样放入 `D:\ollama`，然后执行下面的命令：

```sh
cd D:\ollama

.\OllamaSetup.exe /dir=d:\ollama
```

然后傻瓜式安装就行了，安装完之后会自动运行。

关闭之前的命令行窗口，重新开一个。

```sh
# 查看版本
ollama -v

# 查看命令帮助
ollama -h
```

## Step 3:  下载并运行模型

进入 [Ollama 的 Models 页面](https://ollama.com/search)，选择你想部署的大模型，比如：我想部署 [deepseek](https://ollama.com/library/deepseek-r1)，那么我就找到并选择想要的模型规模，我选择的是7b。我可以使用以下命令去下载和运行该模型。

```sh
# 下载
ollama pull deepseek-r1:7b
# 运行
ollama run deepseek-r1:7b
```

执行完，我们就可以在命令窗里面直接对话了，然后你就可以看到你的显存直接“起飞”了。

对话可以通过 `Ctrl+D` 或者输入 `/bye` 退出，再次执行运行命令可以重新进入窗口对话。

# Open Webui 安装步骤

前面我们安装了 Ollama，但是目前只能是在命令行中去交互，这看上去就很不界面友好，所以我们可以安装一个 Ollama 配套的 Web 客户端，也就是 Open Webui。我用的是 docker 的方式安装。

## Step 1：安装Docker

如果已经有 Docker 了，可以跳过这一步，如果没有直接 [docker 官网](https://docs.docker.com/desktop/setup/install/windows-install/)下载安装包，几乎都是傻瓜式安装，略过。

## Step 2：安装 Open Webui

直接运行如下命令就可以下载并运行了，下面的 3000 是我映射到我主机的端口，这个可以根据自己电脑的情况来配置。

```sh
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

然后，访问 `http://localhost:3000` 就可以看到 Web 页面了。创建的第一个用户就是管理员。

如果不想安装 Open Webui 也可以安装一个 [Cherry Studio](https://cherry-ai.com/)、[Page Assist](https://github.com/n4ze3m/page-assist)、[Anything LLM](https://anythingllm.com/)这样的工具来连接我们本地的 Ollama。

# Ollama API

除了使用一些第三方提供的客户端，也可以使用 Ollama 的 API 去访问他，也可以去开发一些相关的应用。

Ollama 提供了两套 API，一套是他自己的 API，另一套是兼容 Open AI 标准的 API。

## Ollama 自己的API

[官方文档](https://github.com/ollama/ollama/blob/main/docs/api.md)

Ollama 的默认端口是 11434，直接访问 http://localhost:11434 就会看到 `Ollama is running`。

这个默认端口是可以修改的，修改方法如下：

```sh
# 创建系统环境变量
OLLAMA_HOST
# 比如端口修改为11435
0.0.0.0:11435
```

然后重启 ollama 的服务即可。

## 兼容的 Open AI 的 API

[官方文档](https://github.com/ollama/ollama/blob/main/docs/openai.md)

比如下面这段代码：

`example.mjs`

```js
import OpenAI from "openai";
const openai = new OpenAI(
  {
    // 需要但是没有，可以忽略
    apiKey: 'ollama',
    baseURL: "http://localhost:11435/v1/",
  }
);

const completion = await openai.chat.completions.create({
  model: "deepseek-r1:7b",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "你是谁？" }
  ],
});
console.log(completion.choices[0])
```

运行：

```sh
node example.mjs
```

运行结果：

```json
{
  index: 0,
  message: {
    role: 'assistant',
    content: '<think>\n' +
      '我是DeepSeek-R1，一个由深度求索公司开发的智能助手，我会尽我所能为您提供帮助。\n' +
      '</think>\n' +
      '\n' +
      '我是DeepSeek-R1，一个由深度求索公司开发的智能助手，我会尽我所能为您提供帮助。'
  },
  finish_reason: 'stop'
}
```
