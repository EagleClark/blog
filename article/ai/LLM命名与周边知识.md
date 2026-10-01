# LLM 命名与周边知识

> 首发于：2026-10-01
>
> 本文部分内容由 AI 生成。

## 前言

接触的大模型越来越多了，大模型的名字也是越来越多，五花八门，让人摸不着头脑，公司里面部署的模型有时候也会有一些看不懂的后缀，所以它们到底有什么不一样呢，什么场景该选什么模型呢，这得研究研究了。

先看看下面这一堆模型名称：

```
gpt-5.4-mini
gpt-5.4-nano
claude-opus-5
gemini-3.8-flash
qwen3-max-2026-01-23
Qwen3-30B-A3B-Instruct-2507
GLM-4.5-Air（106B-A12B）
Hunyuan-A13B
Llama-4-Scout-17B-16E-Instruct
DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf
gpt-5.6-sol
Qwen3-30B-A3B
Qwen3.8-27B
```
迷惑吗？反正我是挺迷的：一个模型的能力如何、参数量多少、部署要求如何、该用在哪，目前我只能看出个大概，总有一些不太懂的地方。

其实，**模型名不是随便起的，它是一套信息密度极高的缩写系统**。绝大多数命名都能拆成固定的几个字段，看懂了字段，你就能在没有文档的情况下猜出这个模型大概是什么、能不能跑、贵不贵、适合干什么。

这篇文章就干两件事：

1. 把大模型的命名规则拆开，讲清楚每个字段在说什么；
2. 顺着命名，把周边那一圈必须懂的知识（参数量、显存、Token、上下文、量化、蒸馏、评测……）串起来。

全文不展开训练原理，只讲"看得懂、用得上"的部分。

## 模型命名

先给一个通用公式：

```text
主字段：[厂商/系列] + [代际版本] + [参数量] + [能力定位] + [快照日期] + [精度/格式]
可选尾巴：[专家数]（如 16E、8x7b）、[血缘 / 微调标记]（如 Distill、-it、-DPO）
```

对于普通用户来说知道 `厂商/系列 + 代际版本 + 能力定位` 就足够了；而需要自己跑模型的用户，最好把六个字段都弄清楚。

### 厂商/系列

这一段几乎必现，下面是常见系列：

| 前缀 | 厂商 | 特点 |
| --- | --- | --- |
| `gpt` / `o` | OpenAI | `gpt`（Generative Pre-trained Transformer）是通用对话线，`o` 系列（o1/o3/o4-mini）是推理线 |
| `claude` | Anthropic | 用 Opus / Sonnet / Haiku 表示档位，见下文 |
| `gemini` / `gemma` | Google | `gemini` 是闭源旗舰，`gemma` 是开源轻量系列 |
| `llama` | Meta | 开源权重系列，`scout` / `maverick` 是 MoE 档位 |
| `qwen` | 阿里通义千问 | 从 0.5B 到 235B+ 全尺寸覆盖，开源 + 闭源双线 |
| `deepseek` | 深度求索 | V 系列（通用）+ R 系列（推理） |
| `kimi` / `glm` / `doubao` / `hunyuan` / `ernie` | 月之暗面 / 智谱 / 字节 / 腾讯 / 百度 | 国内主流系列 |
| `mistral` / `mixtral` | Mistral AI | `mixtral` 专指 MoE 版本 |
| `grok` | xAI | — |

另外，有些名字里用的是**代号**而不是数字，比如 OpenAI 的 `gpt-5.6-sol`、`gpt-5.6-terra`、`gpt-6-astra`——这类名字只能去官方模型列表里对。

### 代际与版本号

- **语义化版本**：`gpt-5.4`、`gemini-3.8`、`Qwen3`、`DeepSeek-V3.2`。数字越大越新，小数点后面数字增加通常是小幅升级。
- **日期快照**：`qwen3-max-2026-01-23`、`gpt-5.5-2026-04-23`。日期即版本，可精确复现。
- **没有版本号的**：`deepseek-flash` 没有版本号，只能查文档才能知道是哪一代，背后是 DeepSeek-V4.1-Flash。

### 参数规模

- `7B` = 7 Billion = 70 亿参数。
- `235B` = 2350 亿参数。
- `A22B` = **Activated 22B**，即 MoE 架构下每个 token 实际激活 22B 参数。

`B` 前面的数字决定**显存要多大**，`A` 后面的数字决定**算起来多快**，并不能省显存。比如 `Qwen3-235B-A22B`：它拥有 2350 亿的总参数，但每次推理只激活 220 亿参数。这意味着它的推理计算量（FLOPs，浮点运算次数）仅与一个 220 亿参数的密集模型（dense，每个 token 都走全部参数）相当，却能调用相当于 2350 亿参数模型的"知识储备"来解决问题。由于每次计算只涉及激活参数，MoE 模型的推理速度通常更快，单位 token 的生成成本更低。

以上就是 MoE 的好处；代价主要在硬件层面：路由机制给训练和部署引入了额外的工程复杂性。

> [!TIP] MoE（Mixture of Experts，混合专家）
> MoE 是一种让大模型"参数很多，但每次计算只用一小部分"的稀疏架构。它通常用在 Transformer 里，把原来的 FFN（Feed-Forward Network，前馈网络）替换成多个并行的"专家"FFN，再加一个"路由器/门控网络"来决定每个 token 该走哪些专家。

另外，**专家数也可能会写进规模位**：`Llama-4-Scout-17B-16E-Instruct` 里的 `16E` 是 16 个专家，`mixtral-8x7b` 是 8 个专家（复制的是 FFN，所以合计约 47B，而不是 8 × 7B = 56B；每个 token 只走其中 2 个，激活约 13B）；而 `Qwen3-30B-A3B` 只写激活参数、不写专家数——同一个意思，三种写法。

还有把「总参数 - A 激活参数」写进括号的写法，比如 `GLM-4.5-Air（106B-A12B）`。

**例子（参数规模）**：

- 写了——`Llama-3.1-70B-Instruct`（密集 70B）、`Qwen3-30B-A3B`（30B 总参 / 3B 激活）、`mixtral-8x7b`（8 个专家）；
- 只写了激活参数——`Llama-4-Scout-17B`（实际 109B 总参）；
- 完全没写——`claude-opus-5`、`DeepSeek-V3`（671B 得去查文档）。

### 能力定位后缀

这是最"营销"的一段，但也最有规律可循：

| 后缀 | 含义 | 典型用途 |
| --- | --- | --- |
| `Base` / 无后缀 | 基座模型，只会续写，不听话 | 用于二次微调，不适合直接对话 |
| `Instruct` / `it` / `Chat` | 指令微调过，能对话、能听指令 | 绝大多数日常使用场景 |
| `Thinking` / `Reasoner` | 推理模型，先想再答 | 数学、代码、复杂逻辑（如 `DeepSeek-R1`） |
| `Pro` / `Max` / `Ultra` | 该系列最强档 | 不代表参数更大，只代表定位更高 |
| `Flash` / `Turbo` / `Air` | 速度优先、便宜 | 高并发、简单任务 |
| `Mini` / `Nano` / `Lite` / `Small` | 小尺寸、低成本 | 分类、抽取、端侧 |
| `VL`（Vision-Language）/ `V` / `omni` | 视觉/全模态输入 | 看图、看视频、听音频 |
| `Coder` / `Codex` | 代码专精 | 补全、Agent 编码 |
| `Embedding` / `Rerank` | 向量化 / 重排 | RAG（检索增强生成）里的检索与精排 |
| `Preview` / `exp` / `beta` | 实验版 | 可能随时下线，别上生产 |

Anthropic 用的是另一套"文学化"档位：`Haiku`（最小最快）< `Sonnet`（均衡主力）< `Opus`（最强最贵）。所以 `claude-opus-5` 的 `opus` 就等价于别人家的 `Pro/Max`。

Google 的档位则是 `Flash-Lite` < `Flash` < `Pro`，`gemini-3.8-flash` 就是"3.8 代的速度档"。

### 快照日期与 latest 指针

模型名后面跟一串日期（`2024-08-06`、`2026-01-23`），表示这是**冻结的快照**——行为不会变，可以放心写进生产配置。

而不带日期的名字（`gpt-5.4`、`qwen3-max`）或者带 `-latest`（`gpt-5-chat-latest`）的，是**滚动指针**——名字不变，指向的模型却可能被官方换掉。这里的「今天 / 三个月后」指的是**你发起请求的时刻**：

| 你写下的名字 | 今天请求 | 三个月后再请求 |
| --- | --- | --- |
| `qwen3-max`（滚动指针；`gpt-5-chat-latest` 这类 `-latest` 同理） | 官方当时的默认快照——`qwen3-max` 目前等同 `qwen3-max-2026-01-23` | 官方可能已经把它指向更新的快照：**名字没变，背后的模型变了** |
| `gpt-5.4-2026-04-23`（冻结快照） | 就是 `gpt-5.4-2026-04-23` | 还是 `gpt-5.4-2026-04-23`：**行为不变，可复现** |

这是命名里最容易踩的坑：**同一个名字，不同时间的表现可能不一样**。要可复现，就用带日期的快照 ID。

日期本身也有几种写法：

| 写法 | 例子 | 说明 |
| --- | --- | --- |
| 完整日期 | `gpt-5.5-2026-04-23`、`qwen3-max-2026-01-23` | 最清楚，推荐生产环境使用 |
| 年月（YYMM） | `Qwen3-30B-A3B-Instruct-2507` | `2507` = 2025 年 07 月的快照，开源侧常见 |
| 月日（MMDD） | `gpt-4-0613`、`gpt-3.5-turbo-1106` | 早期 OpenAI 的快照写法，`0613` = 6 月 13 日 |
| 完全不带日期 | `claude-opus-5`、`Llama-4-Scout` | 只能查文档确认是哪个快照 |

**例子（快照日期）**：
- 写了——`gpt-5.5-2026-04-23`、`Qwen3-…-2507`、`gpt-4-0613`、`gpt-5-chat-latest`；
- 没写——`claude-opus-5`、`Llama-4-Scout`。

### 精度与量化后缀

> [!TIP] 精度与量化
> 精度是模型参数和计算的数值"分辨率"：精度越高，结果越稳，但越占显存、越慢；量化就是主动降低这个分辨率，用少量精度损失换显存、带宽和速度。

出现在开源模型的文件名里，表示权重被压缩到什么精度：

| 后缀 | 含义 | 大致体积 |
| --- | --- | --- |
| `F32` / `fp32` | 全精度 | 4 字节/参数 |
| `F16` / `bf16` | 半精度，训练与推理默认 | 2 字节/参数 |
| `Q8_0` / `int8` | 8bit 量化 | 1 字节/参数 |
| `Q6_K` / `Q5_K_M` / `Q4_K_M` | GGUF 的 k-quant 系列，数字是位宽，`K` 是分块量化，`_S`/`_M` 是 small/medium 混合策略 | 0.5～0.8 字节/参数 |
| `AWQ` / `GPTQ` / `EXL2` | 面向 GPU 的 4bit 量化方案 | 约 0.5 字节/参数 |
| `MLX` | Apple 的 MLX 框架专用格式 | 视量化档位而定 |
| `Q2_K` / `Q3_K` | 极限压缩 | 效果损失明显，谨慎使用 |

同一个模型，`Q4_K_M` 和 `Q8_0` 的差距是肉眼可见的——量化不是免费的午餐，降的是显存，涨的是困惑度（PPL，Perplexity）。

顺带把缩写补全：**GGUF**（GPT-Generated Unified Format）是 llama.cpp 用的模型文件格式；**AWQ**（Activation-aware Weight Quantization）和 **GPTQ**（Generative Pre-trained Transformer Quantization）是 GPU 上的 4bit 量化方案；**EXL2** 属于 ExLlamaV2，**MLX** 是 Apple 的机器学习框架；**bf16**（Brain Floating Point 16）是常用的半精度格式之一。

**例子（精度量化）**：
- 写了——`Llama-3.1-70B-Instruct-Q4_K_M.gguf`（GGUF 格式，4bit 量化）、`…-AWQ`、`…-MLX`；
- 没写——所有 API 模型（`gpt-5.4`、`qwen3-max`，精度由服务端决定）。

### 把六段拼起来：两个完整的例子

六段拆完了，拼起来看两个真实名字——一个官方发布的模型名，一个社区量化后的文件名：

```text
Qwen3-30B-A3B-Instruct-2507         ← 官方发布的模型名：带规模、带日期，不写精度
  Qwen       厂商/系列  阿里通义千问
  3          代际版本   千问第 3 代
  30B / A3B  参数量     30B 总参数，激活 3B（MoE）
  Instruct   能力定位   指令微调，能直接对话
  2507       快照日期   2025 年 07 月的快照
  ——         精度/格式  官方模型名里不写精度

Llama-3.1-70B-Instruct-Q4_K_M.gguf  ← 社区量化后的文件名：带规模、带精度，不写日期
  Llama       厂商/系列   Meta
  3.1         代际版本    第 3.1 代
  70B         参数量      密集 70B
  Instruct    能力定位    指令微调
  ——          快照日期    社区量化版通常不带日期
  Q4_K_M.gguf 精度/格式   4bit k-quant 量化 + GGUF 格式
```

## 参数规模与显存关系

### 权重显存速算

```text
权重显存 ≈ 参数量 × 每参数字节数
```

再乘上 1.1～1.2 的运行时开销（框架、激活值、碎片），加上 KV Cache，就是实际占用。下面表格里每一格都写出了算式：

| 模型规模 | FP32 / F32（4 字节 / 参数） | FP16 / F16（2 字节 / 参数） | INT8 / Q8（1 字节 / 参数） | INT4 / Q4_K_M（约 0.5 字节 / 参数） |
| --- | --- | --- | --- | --- |
| 7B | 7 × 4 = **28 GB** | 7 × 2 = **14 GB** | 7 × 1 = **7 GB** | 7 × 0.5 = **3.5 GB** |
| 13B | 13 × 4 = **52 GB** | 13 × 2 = **26 GB** | 13 × 1 = **13 GB** | 13 × 0.5 = **6.5 GB** |
| 32B | 32 × 4 = **128 GB** | 32 × 2 = **64 GB** | 32 × 1 = **32 GB** | 32 × 0.5 = **16 GB** |
| 70B | 70 × 4 = **280 GB** | 70 × 2 = **140 GB** | 70 × 1 = **70 GB** | 70 × 0.5 = **35 GB** |
| 235B | 235 × 4 = **940 GB** | 235 × 2 = **470 GB** | 235 × 1 = **235 GB** | 235 × 0.5 = 117.5 ≈ **118 GB** |
| 671B（MoE） | 671 × 4 = 2684 GB ≈ **2.6 TB** | 671 × 2 = 1342 GB ≈ **1.3 TB** | 671 × 1 = **671 GB** | 671 × 0.5 = 335.5 ≈ **336 GB** |

表里是**纯权重**（`FP32` 那一列现实中基本只出现在训练和权重转换环节，推理几乎用不到，列在这里只是把精度阶梯补全）。实际部署要按上面那条公式再乘 1.1～1.2：例如 7B 的 Q4 是 3.5 × 1.2 ≈ 4.2 GB，再加 KV Cache 也就 5 GB 上下——8GB 显卡刚好放得下。

MoE 模型要特别注意：**显存永远按总参数算，不是按激活参数**。比如 `Qwen3-30B-A3B`（30B 总参 / 3B 激活）：FP16 是 `30 × 2 = 60 GB`、Q8 是 `30 × 1 = 30 GB`、Q4 是 `30 × 0.5 = 15 GB`——`A3B` 只决定算得多快，`30B` 才决定装不装得下。表里 `671B（MoE）` 那一行同理。

几个由此而来的经验：

*   **8GB 显存**：7B 的 Q4 量化是舒适区。
*   **24GB 显存**（3090/4090）：32B 的 Q4，或者 70B 的 Q2/Q3（不推荐）。
*   **单机跑 671B**：需要几十张卡或者大内存 + 极慢的 CPU 推理，社区里那些"671B 单机跑起来"的方案，本质是拿时间换显存。

### KV Cache 与并发

**KV Cache** 是一块只在推理时产生的显存：模型逐 token 生成，每生成一个 token 都要用到前面所有 token 的 K（Key）、V（Value）；把这些算过的值缓存下来复用，就不必每一步都重算一遍历史。代价是这块"对话的中间结果"要一直占着显存，直到这段对话结束。

它有多大，主要由两件事决定：

*   **对话有多长**：上下文越长，缓存越大——同一个模型，128K 的缓存是 8K 的 16 倍。
*   **并发数**：**同时在处理的请求数**。每个请求各有一份独立的 KV Cache，所以 10 个人同时聊天就是 10 份。

这也解释了为什么"支持 128K 上下文"和"能同时服务 100 个 128K 的请求"完全是两件事——后者要的不是上下文窗口，而是显存容量。

> **容易误解**：模型名里的 `128K` 指的是**上下文长度**，不是缓存大小。KV Cache 是按 token 逐个攒起来的——128K 上下文意味着这 13 万个 token 各自的 K/V 都要**同时**留在显存里，所以它不是"一点点零头"，而是单个长对话就能吃掉可观显存的大头；并发几个长对话，再按份数往上乘。

> **小提示**：用量面板上那个「缓存命中 xx%」，命中的就是这块 KV Cache——厂商把某段前缀的 KV 存下来跨请求复用，命中部分按折扣价计费（具体折扣见下文价格表）。所以**把系统提示词、工具定义、长文档放在最前面，每次都变的内容放最后**，命中率才高；不过同一段前缀只用一次的话，省下的钱可能还抵不上写入缓存的开销。

## Token 与上下文窗口

### Token 不是字

Token（词元）是模型的最小处理单位，也是**计费单位**。粗略换算：

*   英文：1 token ≈ 3～4 个字符，1000 token ≈ 750 个单词。
*   中文：1 个汉字 ≈ 1～2 个 token，取决于分词器。新版分词器对中文友好得多，但做成本预算时建议按 1.5 倍保守估计。

所以"100 万字上下文"这种宣传，落到账单上要按 token 数算，而不是字数。

### 上下文窗口的几档

| 档位 | 典型代表 | 适合场景 |
| --- | --- | --- |
| 8K～32K | 早期 GPT-3.5/4 | 单轮对话、短文档 |
| 128K | GPT-4 Turbo、GPT-4o 系列 | 整本书、中型代码库 |
| 200K～256K | Claude 3 系列、`qwen3-max`（262144 token） | 长报告、多文件分析 |
| 1M | `deepseek-flash`、`llama-4-maverick` | 全仓库、超长日志 |

要记住两点：

1. **上下文窗口是"装得下"，不是"记得住"**。中间位置的信息召回率明显低于头尾（lost in the middle），长上下文场景一定要做检索或者分段验证。
2. **长上下文很贵**。多数厂商采用阶梯定价，输入越长单价越高。以 `qwen3-max`（北京区域）为例：

| 输入长度 | 输入（美元/百万 token） | 输入·缓存命中 | 输出（美元/百万 token） |
| --- | --- | --- | --- |
| ≤ 32K | 0.359 | 0.072 | 1.434 |
| 32K～128K | 0.574 | 0.115 | 2.294 |
| 128K～256K | 1.004 | 0.201 | 4.014 |

另外注意**缓存命中价**：同一段前缀重复请求时，缓存命中价往往只有正常输入价的 1/5（上表 ≤ 32K 档就是 0.072）。做 Agent 或使用固定 system prompt 的应用，把稳定的部分放前面能省不少钱。

## 周边知识速查

命名之外，还有一批名词会在文档、榜单、论文里反复出现。按「训练 / 调用 / 评测」分三张表速查——前面已经讲过的**量化**和 **KV Cache** 就不再重复了。

### 训练与调优

| 名词 | 一句话解释 |
| --- | --- |
| 预训练（Pre-training） | 用海量文本学"下一词预测"，得到 Base 模型 |
| SFT（Supervised Fine-Tuning，监督微调） | 用人工标注的指令数据教模型听话 |
| RLHF（Reinforcement Learning from Human Feedback，基于人类反馈的强化学习） | 用人类偏好当奖励信号，对齐模型行为 |
| DPO（Direct Preference Optimization，直接偏好优化） | 不走强化学习，直接用偏好数据优化，比 RLHF 简单 |
| GRPO（Group Relative Policy Optimization，组相对策略优化） | 同类偏好优化方法，按一组回答的相对好坏打分 |
| 蒸馏（Distillation） | 让小模型模仿大模型的输出（详见下方） |
| LoRA（Low-Rank Adaptation，低秩适配） | 只训练一小部分新增参数的低成本微调 |
| QLoRA（Quantized LoRA） | 底座量化之后再挂 LoRA，显存更省 |
| 全参微调（Full FT = Full Fine-Tuning） | 更新全部权重，成本高、效果上限高 |

蒸馏值得单独说一句：它**不是把大模型压缩成小的**——学生是另一个模型（底座甚至可以换，比如 `Qwen-7B`），只是被教师的数据训过。所以它继承的是教师的**解题套路和输出风格**，能力上限仍受自己的规模限制；`DeepSeek-R1-Distill-Qwen-7B` 这个名字就是这个意思：拿 `R1` 的数据，训进底座为 `Qwen-7B` 的学生里。它和微调、量化也容易混：**微调**是改行为，**量化**是压精度，**蒸馏**是换一个更小的模型来继承能力。

### 推理与调用

| 名词 | 一句话解释 |
| --- | --- |
| temperature / top_p / top_k | 三个采样旋钮，决定输出"稳"还是"野"（见下方说明） |
| max_tokens | 输出上限，注意"思考 token"也占额度 |
| reasoning effort / thinking budget | 推理模型的思考预算，越高越准越贵 |
| RPM / TPM（Requests / Tokens Per Minute） | 限流指标：每分钟允许多少次请求、多少 token |
| Function Calling（函数调用） | 让模型按 schema 调用外部函数 |
| MCP（Model Context Protocol，模型上下文协议） | 标准化的工具/数据接入协议 |
| Agent（智能体） | 让模型自己规划、调工具、多轮完成的程序 |
| RAG（Retrieval-Augmented Generation，检索增强生成） | 先把资料查出来再回答 |
| 幻觉（Hallucination） | 一本正经地编，需要用检索和校验压制 |

采样这几个参数可以一起理解：模型每一步吐出来的其实是**整个词表的概率分布**，最后选哪个词由采样策略决定。

*   **temperature（温度）**：把分布"拉尖"或"拉平"。调低 → 高概率的词更容易被选中，输出稳定；调到 0 就是每步都取概率最高的那个（贪心解码，几乎可复现）；调高 → 冷门词也有机会，更发散。
*   **top_k**：只在概率最高的 K 个词里抽，其余直接丢掉——候选数量是固定的。
*   **top_p（核采样，nucleus sampling）**：按概率从高到低累加，累计到 p 为止，只在这一小撮里抽——候选数量随分布自动变化，模型越确定候选越少。

**有什么用**：就是在"稳定"和"多样"之间调档。写代码、做抽取、要严格 JSON 输出时越低越稳（一般 temperature 0～0.3，或者干脆贪心）；写文案、起名、头脑风暴时才需要调高。实践上**只动一个**——改了 temperature 就别再动 top_p，top_k 大多数情况不用碰。

### 评测与榜单

这里其实是三件事，混在一起看就容易晕：

*   **评测集（benchmark）**：一套固定的**考题**，比如几千道选择题，谁都能拿它考自己的模型。
*   **榜单（leaderboard）**：把各家模型在同一套考题上的成绩**排成一张表**——这才是看排名的地方。
*   **指标（metric）**：分数怎么算——准确率、通过率、`pass@k`，或者人类投票的胜负。

常见的评测集（括号里是它考什么）：

| 评测集 | 考什么 | 题目 / 仓库 |
| --- | --- | --- |
| MMLU（Massive Multitask Language Understanding）/ MMLU-Pro | 通识与学科知识，选择题 | [github.com/hendrycks/test](https://github.com/hendrycks/test)（题目仓库） |
| GPQA（Graduate-Level Google-Proof Q&A） | 研究生级科学问答，专门挑"搜不到答案"的题 | [github.com/idavidrein/gpqa](https://github.com/idavidrein/gpqa) |
| AIME（American Invitational Mathematics Examination，美国数学邀请赛） | 竞赛数学 | [MAA 赛事页](https://maa.org/math-competitions)（AIME 是其中一项） |
| HumanEval / LiveCodeBench | 函数级代码生成 / 带时间戳的实时编程题 | [openai/human-eval](https://github.com/openai/human-eval)、[LiveCodeBench](https://github.com/LiveCodeBench/LiveCodeBench) |
| SWE-bench（SWE = Software Engineering）Verified | 真实开源仓库里的缺陷修复 | [swebench.com](https://www.swebench.com/) |
| Terminal-Bench | 在终端里跑 Agent、完成命令行长任务 | [tbench.ai](https://www.tbench.ai/) |
| Frontier-Bench | 编码与知识工作的长任务评测 | [frontierbench.ai](https://www.frontierbench.ai/) |

想看排名，去这几处：

| 榜单 | 怎么排的 | 链接 |
| --- | --- | --- |
| LMArena | 人类盲测投票：同一个问题随机给两个模型，让人选哪个答得好 | [lmarena.ai](https://lmarena.ai/) |
| Artificial Analysis | 第三方独立跑分，把多个评测集和价格放在一起比 | [artificialanalysis.ai](https://artificialanalysis.ai/) |
| 厂商自家 blog / 模型卡 | 自己考自己，一般只报最好看的分数 | — |

**`pass@k`** 是让模型做 k 次、至少一次做对的比例（写代码常看 `pass@1`，也就是"一次就对"）。

看榜单的经验：**厂商发布的分数自带主场优势**——提示词、采样参数、工具配置都是自己调的。所以同一张榜单上比"相对排名"有意义，跨榜单比绝对数值没意义。

## 参考资料

*   [OpenAI Python SDK 模型 ID 列表（chat_model.py）](https://github.com/openai/openai-python/blob/main/src/openai/types/shared/chat_model.py)
*   [Introducing Claude Opus 5](https://www.anthropic.com/news/claude-opus-5)
*   [Gemini Models & API IDs: Current Google Model List](https://benchlm.ai/providers/google)
*   [DeepSeek Models: V4.1 Flash, V4 Pro, R1 & V3.2 Compared](https://benchlm.ai/providers/deepseek)
*   [阿里云百炼 qwen3-max 模型信息（上下文与价格）](https://www.alibabacloud.com/help/tc/model-studio/model-qwen3-max)
*   [Llama 4 Scout / Maverick 参数与上下文（open-weights 数据）](https://huggingface.co/datasets/tensorfeed/ai-ecosystem-daily/raw/main/2026-05-23/open-weights.jsonl)
*   [一文解析阿里巴巴通义千问（Qwen）模型的命名规则](https://blog.csdn.net/m0_59614665/article/details/153208545)
