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
    if (-not $status) {
        Write-Log '无改动，跳过提交'
        exit 0
    }

    git add -A
    $staged = git diff --cached --name-only
    if (-not $staged) {
        Write-Log '无可提交改动，跳过'
        exit 0
    }

    $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
    $message = "每日自动提交 $stamp`n`nCo-Authored-By: Claude Code <noreply@anthropic.com>"
    $msgFile = Join-Path $env:TEMP 'drama-daily-commit-msg.txt'
    [System.IO.File]::WriteAllText($msgFile, $message, (New-Object System.Text.UTF8Encoding($false)))

    git commit -F $msgFile
    if ($LASTEXITCODE -ne 0) { throw "git commit 失败，退出码 $LASTEXITCODE" }

    git push origin main
    if ($LASTEXITCODE -ne 0) { throw "git push 失败，退出码 $LASTEXITCODE" }

    Write-Log "提交并推送成功：$stamp"
    exit 0
}
catch {
    Write-Log "失败：$($_.Exception.Message)"
    exit 1
}
