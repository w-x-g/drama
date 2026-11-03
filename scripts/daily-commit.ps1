# 每天 18:07 自动提交并推送 drama 仓库
# 由 Windows 计划任务 DramaDailyGitCommit 调用
$ErrorActionPreference = 'Stop'
$env:GIT_TERMINAL_PROMPT = '0'

$repo = 'D:\学习\drama'
$logDir = Join-Path $env:LOCALAPPDATA 'DramaDailyCommit'
$log = Join-Path $logDir 'commit.log'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Write-Log([string]$message) {
    $line = '{0} {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $message
    Add-Content -Path $log -Value $line -Encoding UTF8
}

try {
    Set-Location $repo

    $status = git status --porcelain
    if ($status) {
        git add -- CLAUDE.md HANDOFF.md .gitignore 短剧项目 scripts "AI视频制作学习计划.md" "重生后我退了婚约才知道暗恋我十年的人一直在等我.txt"
        $staged = git diff --cached --name-only
        if ($staged) {
            $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
            $message = "每日自动提交 $stamp`n`nCo-Authored-By: Claude Code <noreply@anthropic.com>"
            $msgFile = Join-Path $env:TEMP 'drama-daily-commit-msg.txt'
            [System.IO.File]::WriteAllText($msgFile, $message, (New-Object System.Text.UTF8Encoding($false)))

            git commit -F $msgFile
            if ($LASTEXITCODE -ne 0) { throw "git commit 失败，退出码 $LASTEXITCODE" }
            Write-Log "提交成功：$stamp"
        }
        else {
            Write-Log '工作区有改动，但没有可提交的项目文件'
        }
    }
    else {
        Write-Log '工作区无改动'
    }

    # 工作区干净时也要补推：处理上次网络失败留下的未推送提交
    $ahead = git rev-list --count origin/main..HEAD
    if ($LASTEXITCODE -ne 0) { $ahead = '0' }

    if ([int]$ahead -gt 0) {
        git push origin main
        if ($LASTEXITCODE -ne 0) { throw "git push 失败，退出码 $LASTEXITCODE" }
        Write-Log "推送成功：领先 origin/main $ahead 个提交"
    }
    else {
        Write-Log '无需推送'
    }

    exit 0
}
catch {
    Write-Log "失败：$($_.Exception.Message)"
    exit 1
}
