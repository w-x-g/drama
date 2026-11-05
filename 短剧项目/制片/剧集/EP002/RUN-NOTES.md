# EP002 长明灯 · RUN-NOTES

## 1. 基本数

- 镜数：19
- 总时长：88 秒（全部为 4–15 秒整数；单镜 4/5/6 秒）
- 平均镜长：4.6 秒
- 近景类：16 镜，占 84%
- 台词：21 句，199 个可发声字（不含标点）
- 语速：按 4.5 字/秒上限设计，最短发声约 44.2 秒；17 个对白镜各留 0.5 秒开口延迟
- 画面文字：1 处（灯牌「温蘅平安」），后期叠加；拍摄时牌面留白/虚焦
- 参考图：全部为 `PLAN-...` 挂图计划，项目内暂无真实图片；未调用任何付费 API，未生成图片或视频

## 2. 用到的锁（13 条，锁面逐字取自资产圣经）

| 锁 | 条目 | 锁面 |
|---|---|---|
| LOCK-SUINING-DRESS | 岁宁待嫁襦裙 | moon-white cross-collar ruqun under a pale blue-grey bijia |
| LOCK-SUINING-CLOAK | 岁宁出行披风 | slate-blue travelling cloak |
| LOCK-YANBAI-PALEROBE | 砚白月白长衫 | moon-white scholar's long robe |
| LOCK-PEI-RIDING | 裴珩玄色骑装 | black riding coat with a dark leather belt |
| LOCK-CHUNXING-DRESS | 春杏藕荷短袄 | mauve short jacket with a plain apron |
| LOCK-ABBOT-ROBE | 主持灰褐僧袍 | grey-brown monk's robe |
| LOCK-SHEN-GATE | 沈家院门 | grey stone gatehouse with dark timber doors |
| LOCK-SHEN-HALL | 沈家正厅 | timber reception hall with a dark rosewood table |
| LOCK-CARRIAGE | 马车内 | dark timber carriage interior with padded benches |
| LOCK-TEMPLE-HALL | 佛寺大殿 | grey stone temple hall with a wall of golden long-life lamps |
| LOCK-TEMPLE-STEPS | 佛寺山门石阶 | worn stone temple steps between old pines |
| LOCK-LAMP | 长明灯 | small brass long-life oil lamp with a golden flame |
| LOCK-LETTER | 旧信 | white rice-paper letter |

未用到的锁（EP003/EP004 的玉佩、玉扣、茯苓糕、梅枝、绣梅帕、退婚书、婚服等）没有出现在本集任何提示词里。

## 3. 地点跳变怎么处理

EP001 信里写的是「三月十五，城郊猎场」；原著第 5 章实际到佛寺。本集不建猎场，处理分两层：

1. **台词**：马车门刚合上，沈岁宁说「世子，不去猎场。送我去佛寺。」——一句话把旧目的地和新目的地都交代清楚，且是她主动改口，不是剪辑硬跳。
2. **动作**：裴珩看她一眼，抬手在车壁上叩两下；车夫勒马，车身一顿，转向上山的路。观众看见车真的改了方向，下一镜才进佛寺大殿。

这样地点变化是她的选择，不是制作漏洞；也顺带表现她直到车门关上、离开沈家耳目才亮出真实目的。

## 4. 与分集地图/原著的取舍

- 保留的必需节点：门房通报、裴珩攥皱信登门、正厅答应护送、江砚白以温蘅着凉为由拦人、攥腕「你在逼我」、马车「有没有人欺负你」、佛寺长明灯、「江家公子，便是本月初与沈家定亲的那位江公子？」、裴珩挡身「代价不小」、江砚白拂袖离场、山门石阶半句话。
- 压缩掉的台词：江砚白「你什么时候与裴珩走得这样近了」、沈岁宁「你陪你的温姑娘去寻大夫」的完整版、江砚白「岁宁，你误会了」和「裴珩，你什么意思」「字面意思」的往返。88 秒装不下，删的是重复解释，不是转折。
- 主持的回答压缩为「江家公子，半月前亲自来立的。」——「为一位温姑娘」由灯牌四字（后期叠加）承担，避免 6 秒镜里塞 29 字。
- 沈岁宁的「我从来没有逼过你」压缩为「我从未逼过你」，为 5 秒镜留出反应时间。

## 5. 不确定的地方

1. **旧信的持物连续性**：本集让裴珩从院门到石阶一直带着那封皱信（马车里压在掌下，殿内握在右拳，石阶上折起收进衣襟）。部分镜头（马车、第 18 镜）只在起始帧和正文里钉住信，没有单独挂 `IMG-LETTER` 参考槽，避免每镜多一张道具板；如果创作者希望每镜都挂道具板，需要补槽位并重排 `<Picture N>`。
2. **春杏只出现在第 1 镜**：她的手和袖口在门板内侧，脸不入画。分集地图把春杏列进 required_assets，本集用这一镜交代她在场；如果想让春杏有更多反应，需要加镜，会挤掉 88 秒里的其他内容。
3. **灯牌四字**：H3 对画内中文的控制不稳定，正文已写死「blank wooden tag, no readable characters」，四字只能后期叠加；生成后要逐帧检查牌面有没有冒字。
4. **「傍晚前」的光**：资产圣经写石阶是「傍晚前」，本集按冷白偏晚的日光处理，没有做夕阳暖调，避免抢掉佛寺金。
5. **斗篷与襦裙的层次**：披风前襟是敞开的，所以 `LOCK-SUINING-DRESS` 与 `LOCK-SUINING-CLOAK` 同时入画；如果实际造型把披风系死、遮住前襟，可以把 DRESS 锁从对应镜头撤掉，但本集按「前襟可见」写。
6. **第 12 镜的推近**：4 秒内从灯架全景推到第二层第七盏，推幅较大；如果生成后落点不准，优先保「停在那盏灯前」的终点，把推近改成两镜（会超 88 秒，需要从别处减 1–2 秒）。
7. **未做机械核对**：本次没有运行 `creator_markdown_check.py`；锁面、`<Picture N>`、时长和台词字数已用脚本自查，正式投产前建议再跑一次套件核对。

## 6. 文件

- `剧本.md`：5 场，21 句台词
- `视觉设定.md`：5 个人物、6 套造型、5 个地点、2 个道具，13 条锁
- `图片提示词.md`：12 张资产板（5 人物/造型 + 5 场景 + 2 道具）
- `分镜.md`：19 镜，88 秒，每镜冻结关键帧
- `视频提示词.md`：19 条 MOTION，MiniMax H3 六段式 full-reference
