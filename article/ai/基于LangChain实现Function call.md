# 基于LangChain实现Function call

> 首发于：2025-03-26

## 什么是 LangChain

### 简介

[LangChain](https://www.langchain.com/) 是一个基于大语言模型（LLM）开发应用程序的框架。

LangChain 简化了LLM应用程序生命周期的每个阶段：

- 开发：使用 LangChain、LangGraph
- 生产化：使用 LangSmith
- 部署：使用 LangGraph  Platform

LangChain 是核心框架，构建基础应用用 LangChain 即可，而 LangGraph 是 LangChain 的一个扩展，适合复杂的工作流。LangSmith 用于调试和优化。LangGraph  Platform 则是一个部署和管理平台，整合前面三项的能力用的。

本文主要侧重讲 LangChain。

### 安装及基础使用

直接使用

```sh
pip install langchain
```

再安装 OpenAI 的库

```sh
pip install llangchain_openai
```



连接一个大模型，并进行一次对话。注：该案例是用的兼容OpenAI规范的非流式调用，一定要用支持非流式调用的大模型，否则会报错。

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
  base_url="AI提供商提供的URL",
  model="模型名称",
  api_key="你的API_KEY",
)

messages = [
  SystemMessage("Translate the following from English into Spanish"),
  HumanMessage("Hello!"),
]

response = llm.invoke(messages)
print(response.content)  # ¡Hola!
```

再来一个流式调用的对话，也就是一个 token 一个 token 的吐字儿：

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
  base_url="AI提供商提供的URL",
  model="模型名称",
  api_key="你的API_KEY",
  streaming=True
)

messages = [
  SystemMessage("Translate the following from English into Chinese."),
  HumanMessage("Let's first use the model directly. ChatModels are instances of LangChain Runnables, which means they expose a standard interface for interacting with them. To simply call the model, we can pass in a list of messages to the .invoke method."),
]

for token in llm.stream(messages):
  print(token.content, end="\n")

# 首先我们直接使用模型
# 。ChatModels是LangChain
#  可运行对象
# 的实例，这意味着它们提供
# 了一个标准接口来进行
# 交互。要直接调
# 用模型，我们
# 可以通过:invoke方法传入
# 一个消息列表。
```

提示词 formatter：

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

examples = [
    {
        "question": "Who lived longer, Muhammad Ali or Alan Turing?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: How old was Muhammad Ali when he died?
Intermediate answer: Muhammad Ali was 74 years old when he died.
Follow up: How old was Alan Turing when he died?
Intermediate answer: Alan Turing was 41 years old when he died.
So the final answer is: Muhammad Ali
""",
    },
    {
        "question": "When was the founder of craigslist born?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: Who was the founder of craigslist?
Intermediate answer: Craigslist was founded by Craig Newmark.
Follow up: When was Craig Newmark born?
Intermediate answer: Craig Newmark was born on December 6, 1952.
So the final answer is: December 6, 1952
""",
    },
    {
        "question": "Who was the maternal grandfather of George Washington?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: Who was the mother of George Washington?
Intermediate answer: The mother of George Washington was Mary Ball Washington.
Follow up: Who was the father of Mary Ball Washington?
Intermediate answer: The father of Mary Ball Washington was Joseph Ball.
So the final answer is: Joseph Ball
""",
    },
    {
        "question": "Are both the directors of Jaws and Casino Royale from the same country?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: Who is the director of Jaws?
Intermediate Answer: The director of Jaws is Steven Spielberg.
Follow up: Where is Steven Spielberg from?
Intermediate Answer: The United States.
Follow up: Who is the director of Casino Royale?
Intermediate Answer: The director of Casino Royale is Martin Campbell.
Follow up: Where is Martin Campbell from?
Intermediate Answer: New Zealand.
So the final answer is: No
""",
    },
]

example_prompt = PromptTemplate.from_template("Question: {question}\n{answer}")

prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    suffix="Question: {input}",
    input_variables=["input"],
)

llm = ChatOpenAI(
  base_url="AI提供商提供的URL",
  model="模型名称",
  api_key="你的API_KEY",
)

print(prompt.invoke({"input": "Who is the father of Mary Ball Washington?"}).to_string())
# Question: Who was the maternal grandfather of George Washington?

# Are follow up questions needed here: Yes.
# Follow up: Who was the mother of George Washington?
# Intermediate answer: The mother of George Washington was Mary Ball Washington.
# Follow up: Who was the father of Mary Ball Washington?
# Intermediate answer: The father of Mary Ball Washington was Joseph Ball.
# So the final answer is: Joseph Ball


# Question: Who was the father of Mary Ball Washington?

messages = [
  HumanMessage(prompt.invoke({"input": "Who is the father of Mary Ball Washington?"}).to_string()),
]

for token in llm.stream(messages):
  print(token.content, end="\n")

# The father of Mary
#  Ball Washington was Joseph Ball.

# So the final answer
#  is: Joseph Ball
```



### 与OpenAI 提供的 API 工具包对比

其实 LangChain 的很多功能 [OpenAI 提供的 API 工具包](https://platform.openai.com/docs/overview)也能实现，比如下面这段代码：

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{
        role: "user",
        content: "Write a one-sentence bedtime story about a unicorn.",
    }],
});

console.log(completion.choices[0].message.content);
```

但是这俩也有很多不同，他们其实不是同一层次的技术方案，定位和使用场景有显著区别：

| **类别**     | **OpenAI API 工具包**                                        | **LangChain**                                                |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **定位**     | **直接访问模型的接口**                                       | **AI应用开发框架**                                           |
| **核心功能** | 提供对单一模型（如GPT-4、DALL·E等OpenAI兼容的模型）的直接调用 | 提供构建复杂AI应用的工具链，支持多模型、工具、数据的编排和流程管理 |

- **OpenAI API**：直接调用 OpenAI 的模型，返回生成结果（如文本生成、图片生成等），属于低层级工具。
- **LangChain**：通过模块化组件（Agents、Chains、Memory等），将模型能力与外部工具（如搜索引擎、数据库、API）、业务流程结合，构建端到端应用。

## 什么是 Function calling

### 简介

Function calling 也叫 Tool Calling 提供了一种自然语言模型与系统（数据库或API）交互的通道。下图是一个例子：

![Conceptual parts of tool calling](https://python.langchain.com/assets/images/tool_calling_components-bef9d2bcb9d3706c2fe58b57bf8ccb60.png)

1. 首先我们得有工具，这里的工具就是数据库和访问数据库的接口；
2. 让上述工具与大模型建立一个绑定关系；
3. 大模型在被提特定问题时，就会告诉应用程序“刚才用户问的问题，似乎要用到 xxx工具才能解决，参数我帮你提取出来了，你拿去找到对应工具执行一下吧”。
4. 我们的应用程序就会根据大模型提供的信息去调用对应的工具获取结果并返回给用户。

大模型擅长推理，并且大模型的训练数据通常是半年前甚至更早的，所以大模型在面对一些问题的时候可能就会显得束手无策，比如，我们下面要解决的天气问题，大模型的训练数据是肯定不可能包含有当前的天气数据的，所以想要问大模型这类问题时我们就需要借用 Function calling 的能力。

### 一个极简的 Function Calling 示例

```python
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def multiply(a: int, b: int) -> int:
    """Multiply a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b

# Tool creation
tools = [multiply]

tool_calling_model = ChatOpenAI(
  base_url="AI提供商提供的URL",
  model="模型名称",
  api_key="你的API_KEY",
)

# Tool binding
llm_with_tools = tool_calling_model.bind_tools(tools)

# Tool calling
response = llm_with_tools.invoke("What is 2 multiplied by 3?")

print(response.additional_kwargs.get("tool_calls"))
# [{'id': 'call_e6695b1a5bee41c8baad81', 'function': {'arguments': '{"a": 2, "b": 3}', 'name': 'multiply'}, 'type': 'function', 'index': 0}]

#拿到这些信息那么就只需要解析一下就可以调用并返回结果了
toolsCalling = response.additional_kwargs.get("tool_calls")

if (toolsCalling[0]["function"]["name"] == "multiply"):
    args = json.loads(toolsCalling[0]["function"]["arguments"])
    result = multiply.run(args)
    print(result)
    # 6
else:
    print("I don't know how to do that")
```

## 实现大模型获取天气数据

有了上面的例子其实这个实例就很好实现了，这里我准备使用[心知天气](https://www.seniverse.com/)来获取天气数据。

```python
import json
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
import requests

@tool
def get_weather(city: str) -> str:
  """Get the weather in a given city."""
  res = requests.get('https://api.seniverse.com/v3/weather/now.json?key=YOUR_API_KEY&location=' + city + '&language=zh-Hans&unit=c')
  return city + "当前温度为" + json.loads(res.text)["results"][0]["now"]["temperature"] + "摄氏度"

# Tool creation
tools = [get_weather]

tool_calling_model = ChatOpenAI(
  base_url="AI提供商提供的URL",
  model="模型名称",
  api_key="你的API_KEY",
)

# Tool binding
llm_with_tools = tool_calling_model.bind_tools(tools)

# Tool calling
response = llm_with_tools.invoke("锡林浩特现在温度是多少?")

print(response.additional_kwargs.get("tool_calls"))
# [{'id': 'call_189b93e32ee247b1a36986', 'function': {'arguments': '{"city": "锡林浩特"}', 'name': 'get_weather'}, 'type': 'function', 'index': 0}]

toolsCalling = response.additional_kwargs.get("tool_calls")

if (toolsCalling[0]["function"]["name"] == "get_weather"):
    args = json.loads(toolsCalling[0]["function"]["arguments"])
    result = get_weather.run(args)
    print(result)
    # 锡林浩特当前温度为-4摄氏度
else:
    print("No tool found")
```
