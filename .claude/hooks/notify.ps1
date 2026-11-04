# Notification hook: toast + beep when Claude Code needs input or permission.
$msg = 'Claude Code needs your input'
try {
  $raw = [Console]::In.ReadToEnd()
  if ($raw) { $j = $raw | ConvertFrom-Json; if ($j.message) { $msg = $j.message } }
} catch {}
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Media.SystemSounds]::Asterisk.Play()
$n = New-Object System.Windows.Forms.NotifyIcon
$n.Icon = [System.Drawing.SystemIcons]::Information
$n.BalloonTipTitle = 'Claude Code'
$n.BalloonTipText = $msg
$n.Visible = $true
$n.ShowBalloonTip(8000)
Start-Sleep -Seconds 9
$n.Dispose()
