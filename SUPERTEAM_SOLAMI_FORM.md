# Superteam Earn — Solami track submission draft

当前状态：材料草稿已完成，尚未提交。

## 表单字段

### Link to Your Submission

提交公开项目主页或演示链接。当前待补：

```text
<PUBLIC_PROJECT_URL>
```

### Tweet Link

可选。当前待补：

```text
<PUBLIC_X_POST_URL>
```

### Project Name

```text
Solana Risk Stream
```

### Project Description

```text
Solana Risk Stream is a read-only, real-time risk monitor for Solana activity. It reads recent mainnet transactions and account activity, scores signals such as failed transactions, large SOL movement, token write fan-out, and unusual account fan-out, and returns a deterministic PASS/WARN/BLOCK report. The data adapter is designed for Solami infrastructure: the same risk engine can consume Solami RPC, Blur decoded market data, or a Solami WebSocket stream without changing the analysis rules. The project never signs, broadcasts, or custody transactions.
```

### Project Github Link

提交公开仓库地址。当前待补：

```text
<PUBLIC_GITHUB_REPO_URL>
```

### Project Website

可选。当前待补：

```text
<PUBLIC_DEMO_URL>
```

### Project X Link

可选。当前待补：

```text
<PUBLIC_X_PROJECT_URL>
```

### Link to your pitch deck or Loom/video presentation

必须提供 2–3 分钟、运行在 Solana 主网的演示视频。当前待补：

```text
<PUBLIC_LOOM_OR_VIDEO_URL>
```

### Did you submit this project to the official Frontier Hackathon on Colosseum?

当前应填写：

```text
No — not submitted yet
```

### Link to Colosseum project

只有提交主赛后填写。当前待补：

```text
<COLOSSEUM_PROJECT_URL_OR_EMPTY>
```

### Link to your project's Colosseum profile

只有存在 Colosseum 项目档案后填写。当前待补：

```text
<COLOSSEUM_PROFILE_URL_OR_EMPTY>
```

### Anything Else?

```text
Local project path: D:/Codex/workspaces/solana-risk-stream

The repository includes setup instructions, an environment-variable template, a read-only Solami stream adapter, a risk scoring engine, an HTTP dashboard, and automated tests. A live submission requires a Solami API key and a public mainnet demo URL.
```

## 当前不能提交的原因

1. 没有公开 GitHub 仓库地址。
2. 没有 2–3 分钟主网演示视频。
3. 没有 Solami API Key，因此无法证明 Solami 是实际数据路径。
4. 尚未有 Colosseum 主赛项目链接。
