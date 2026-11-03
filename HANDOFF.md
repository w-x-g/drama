# 会话上下文快照 / 跨电脑交接

> 生成时间：2026-11-03
> 用途：换电脑、开新会话、或隔一段时间回来时，用最快的速度恢复上下文。

---

## 一、这次会话做了什么

1. 通读《AI视频制作学习计划.md》和小说《重生后我退了婚约才知道暗恋我十年的人一直在等我》。
2. 确定项目规格：4 集 × 60–90 秒、竖屏 9:16、冷调宅斗、分阶段实战教学。
3. 把 12 章拆成 4 集，定下每集核心事件、集尾钩子、情绪目标。
4. 把 md 的 6 个阶段 / 12 周压缩成 12 课，每课对应一个知识点和一个项目交付物。
5. 产出第 01 课讲义：景别与信息释放。

## 二、已定决策

| 项目 | 决定 |
|------|------|
| 成片规模 | 4 集 × 60–90 秒样片 |
| 画幅 | 竖屏 9:16 |
| 视觉基调 | 冷调宅斗：低饱和青灰 + 梨花白 + 烛火暖点 |
| 教学方式 | 按集推进：一集从剧本到成片走完整流程，做完再进下一集；不布置作业，不设验收评分 |
| 项目代号 | 梨花误 |
| 第 1 集范围 | 第 1–3 章：临终 → 重生 → 拒婚 → 写信给裴珩 |
| 上下文同步 | 方案 A：项目文件入库；每天 18:07 由 Windows 计划任务 `DramaDailyGitCommit` 自动 commit + push；不提交原始会话 JSONL |

## 三、当前进度

- [x] 项目总纲 `短剧项目/00-项目总纲.md`
- [x] 基础参考：第 01 课景别、第 02 课视觉命题
- [x] EP01 剧本 `短剧项目/EP01-死局重启-剧本.md`
- [x] EP01 分镜与制作包 `短剧项目/EP01-死局重启-制作包.md`
- [x] EP01 剧本→分镜教学 `短剧项目/EP01-从剧本到分镜-第1-2课.md`
- [ ] EP01 关键帧与成片
- [ ] EP02 制作包与成片

## 四、下一步怎么接着上

在新电脑或新会话里，直接说：

> 继续《梨花误》短剧项目，从 EP01 制作包开始。

Claude 会读取 `CLAUDE.md`、本文件和 `短剧项目/`，恢复上下文。

---

## 五、跨电脑同步的两种方案

### 方案 A：同步仓库文件（推荐）

对话记录本身不是好的 git 资产：体积大、含本机绝对路径、diff 不可读、可能含敏感内容。更稳的做法是把"上下文"沉淀成可读文件：

- `CLAUDE.md`：项目规则与当前进度，Claude 每次进入仓库自动加载；
- `HANDOFF.md`：本文件，决策与交接；
- `短剧项目/`：所有课程交付物。

本机已注册 Windows 计划任务 `DramaDailyGitCommit`：每天 18:07 运行 `scripts/daily-commit.ps1`，有改动才提交并推送；日志在 `%LOCALAPPDATA%\DramaDailyCommit\commit.log`。删除任务：

```powershell
Unregister-ScheduledTask -TaskName 'DramaDailyGitCommit' -Confirm:$false
```

操作：

```powershell
cd D:\学习\drama
git add CLAUDE.md HANDOFF.md 短剧项目
git commit -m "添加短剧项目总纲、第01课与上下文交接文档"
git push
```

另一台电脑：

```powershell
git clone https://github.com/w-x-g/drama.git D:\学习\drama
cd D:\学习\drama
claude
```

然后让 Claude 先读 `CLAUDE.md` 和 `HANDOFF.md` 即可。

### 方案 B：原样恢复这次会话（可选）

Claude Code 的会话记录存在本机：

```
C:\Users\A\.claude\projects\d-----drama\975a32e6-3906-41dd-a1e5-3ad893897ab5.jsonl
```

目录名规则：**项目绝对路径里的每个非字母数字字符，各替换成一个 `-`**。`D:\学习\drama` → `d-----drama`。

**本机提交：**

```powershell
cd D:\学习\drama
New-Item -ItemType Directory -Force ".claude\sessions\d-----drama" | Out-Null
Copy-Item "$env:USERPROFILE\.claude\projects\d-----drama\975a32e6-3906-41dd-a1e5-3ad893897ab5.jsonl" ".claude\sessions\d-----drama\"
git add .claude/sessions
git commit -m "保存本次会话记录（用于跨电脑恢复）"
git push
```

**另一台电脑恢复：**

```powershell
git clone https://github.com/w-x-g/drama.git D:\学习\drama
$proj = "d-----drama"   # 只有新电脑项目路径也是 D:\学习\drama 时才用这个
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\projects\$proj" | Out-Null
Copy-Item "D:\学习\drama\.claude\sessions\d-----drama\*.jsonl" "$env:USERPROFILE\.claude\projects\$proj\"
cd D:\学习\drama
claude --resume
```

在列表里选择 `975a32e6-3906-41dd-a1e5-3ad893897ab5` 即可。

**注意事项：**

- 如果新电脑的项目路径不是 `D:\学习\drama`，编码目录名会变，要按上面的规则重新算；
- 会话文件会持续变大，提交前确认仓库是**私有**的；
- 不同版本的 Claude Code 对旧会话的解析可能有差异，恢复后建议先用方案 A 的文件补一遍上下文；
- 更稳妥的替代：把 jsonl 通过私有网盘/U 盘拷贝，不进入 git 历史。
