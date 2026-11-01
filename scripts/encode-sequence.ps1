# Joins the transition clips of a stage's scroll film and encodes them for scrubbing.
# Clip 2 starts on the frame clip 1 ends on, so its first frame is dropped at the seam. The encode has a keyframe
# every 6 frames and no B-frames, so a seek anywhere decodes at most 5 frames: smooth both ways on scroll.
# -Delogo takes "x:y:w:h" boxes (in the 1280x720 output) to blend away, such as the generator's corner marks.
# Usage (from the site folder):
#   ./scripts/encode-sequence.ps1 -Clips a.mp4, b.mp4 -Out public/media/data-eras -Delogo 1238:690:32:20, 1172:636:38:38
param(
  [Parameter(Mandatory)][string[]]$Clips,
  [Parameter(Mandatory)][string]$Out,
  [string[]]$Delogo = @()
)
$ErrorActionPreference = "Stop"
$inputs = @()
$parts = @()
for ($i = 0; $i -lt $Clips.Count; $i++) {
  $inputs += @("-i", $Clips[$i])
  $trim = if ($i -gt 0) { "trim=start_frame=1," } else { "" }
  $parts += "[$($i):v]$($trim)setpts=PTS-STARTPTS,scale=1280:720:flags=lanczos,fps=24,format=yuv420p[v$i]"
}
$clean = ($Delogo | ForEach-Object { $b = $_ -split ":"; ",delogo=x=$($b[0]):y=$($b[1]):w=$($b[2]):h=$($b[3])" }) -join ""
$joined = ($(0..($Clips.Count - 1) | ForEach-Object { "[v$_]" }) -join "") + "concat=n=$($Clips.Count):v=1:a=0$clean[out]"
$filter = ($parts + $joined) -join ";"
ffmpeg -y -hide_banner -loglevel error @inputs -filter_complex $filter -map "[out]" -an `
  -c:v libx264 -preset slow -crf 28 -x264-params "keyint=6:min-keyint=1:bframes=0:scenecut=0" `
  -movflags +faststart "$Out.mp4"
ffmpeg -y -hide_banner -loglevel error -i "$Out.mp4" -frames:v 1 -q:v 6 "$Out.jpg"
Get-Item "$Out.mp4", "$Out.jpg" | ForEach-Object { "{0}  {1:N0} KB" -f $_.Name, ($_.Length / 1KB) }
