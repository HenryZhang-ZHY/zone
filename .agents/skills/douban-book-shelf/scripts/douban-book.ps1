<#
.SYNOPSIS
Fetch a Douban book's metadata and cover, then print the exact entry to add to src/content/book.yaml.

.DESCRIPTION
Reads og: meta tags and the #info block from a Douban subject page (no login, no browser),
downloads the cover, scales it to the shelf's 270px width, and prints a ready-to-paste YAML
block together with the anchor it belongs after. It never edits book.yaml — the caller applies
the insertion so the change stays reviewable as a diff.

Exits 2 when the subject/ISBN is already on the shelf, 3 when the requested -After anchor does
not exist, so the caller can branch without parsing prose.

.EXAMPLE
./douban-book.ps1 37397789 -After "打造第二大脑"
Fetch, write the cover, and print the entry that goes after 打造第二大脑.

.EXAMPLE
./douban-book.ps1 37397789 -DryRun
Print everything, write nothing.
#>
[CmdletBinding()]
param(
	[Parameter(Mandatory = $true, Position = 0)]
	[string]$Subject,

	[string]$After,

	[switch]$DryRun,

	[string]$Root = '.'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
$CoverWidth = 270
$CoverQuality = 84

function Get-FirstMatch {
	param([string]$Text, [string]$Pattern)
	$m = [regex]::Match($Text, $Pattern)
	if ($m.Success) { return $m.Groups[1].Value }
	return ''
}

function Get-BookBlocks {
	param([string]$Yaml)
	@($Yaml -split "\r?\n\r?\n" | Where-Object { $_.Trim().Length -gt 0 })
}

function Get-BlockField {
	param([string]$Block, [string]$Field)
	Get-FirstMatch $Block ('(?m)^\s*' + $Field + ':\s*"([^"]*)"')
}

$rootPath = (Resolve-Path -LiteralPath $Root).Path
$yamlPath = Join-Path $rootPath 'src/content/book.yaml'
$coverDir = Join-Path $rootPath 'src/assets/books'
if (-not (Test-Path -LiteralPath $yamlPath)) {
	throw "No $yamlPath - pass -Root <repo root> (the directory holding src/content/book.yaml)."
}

$subjectUrl = "https://book.douban.com/subject/$Subject/"
$html = (Invoke-WebRequest -Uri $subjectUrl -Headers @{ 'User-Agent' = $UserAgent } -UseBasicParsing).Content

$title = Get-FirstMatch $html '<span property="v:itemreviewed">([^<]+)</span>'
if ($title -eq '') {
	throw "No title found at $subjectUrl - wrong subject id, or Douban served a block page."
}
$subtitle = Get-FirstMatch $html '<span property="v:subtitle">([^<]+)</span>'
$coverUrl = Get-FirstMatch $html '<meta property="og:image" content="([^"]+)"'
$infoText = ((Get-FirstMatch $html '<div id="info">([\s\S]*?)</div>') -replace '<[^>]+>', ' ' -replace '&nbsp;', ' ' -replace '\s+', ' ').Trim()
$isbn = Get-FirstMatch $infoText 'ISBN:\s*([0-9Xx-]+)'
# 出版社 is a link to the press page; 出版年 is bare text right after its label.
$press = (Get-FirstMatch $html '出版社:</span>\s*(?:<a[^>]*>)?([^<]+)').Trim()
$year = (Get-FirstMatch $html '出版年:</span>\s*(?:<a[^>]*>)?([^<]+)').Trim()

# --- refuse duplicates before touching anything ---------------------------------
$yamlText = Get-Content -LiteralPath $yamlPath -Raw
$blocks = Get-BookBlocks $yamlText
$duplicate = $null
if ($yamlText -match ('subject/' + [regex]::Escape($Subject) + '/')) {
	$duplicate = 'subject URL'
}
elseif ($isbn -ne '' -and $yamlText -match ('id:\s*"' + [regex]::Escape($isbn) + '"')) {
	$duplicate = "ISBN $isbn"
}
if ($duplicate) {
	$owner = $blocks | Where-Object {
		$u = Get-BlockField $_ 'ogUrl'; $i = Get-BlockField $_ 'id'
		($u -like "*subject/$Subject/*") -or ($isbn -ne '' -and $i -eq $isbn)
	} | Select-Object -First 1
	$ownerTitle = if ($owner) { Get-BlockField $owner 'title' } else { '' }
	$label = if ($ownerTitle -and $ownerTitle -ne $title) { "$title ($ownerTitle)" } else { $title }
	Write-Output "ALREADY PRESENT: $label is already on the shelf ($duplicate). Nothing to do."
	exit 2
}

# --- cover ----------------------------------------------------------------------
$coverName = [System.IO.Path]::GetFileNameWithoutExtension(([uri]$coverUrl).AbsolutePath)
$coverPath = Join-Path $coverDir "$coverName.jpg"
if ($coverUrl -eq '') { throw 'No og:image on the page; add the entry by hand and copy a cover manually.' }
$bigUrl = $coverUrl -replace '/(s|m|raw)/public/', '/l/public/'
$tmpPath = Join-Path ([System.IO.Path]::GetTempPath()) "douban-$coverName.jpg"

Add-Type -AssemblyName System.Drawing
Invoke-WebRequest -Uri $bigUrl -OutFile $tmpPath -Headers @{ 'User-Agent' = $UserAgent; 'Referer' = $subjectUrl } -UseBasicParsing

$source = [System.Drawing.Image]::FromFile($tmpPath)
$sourceWidth = $source.Width
$sourceHeight = $source.Height
$targetWidth = [Math]::Min($CoverWidth, $sourceWidth)
$targetHeight = [int][Math]::Round($sourceHeight * $targetWidth / $sourceWidth)
$ratio = $sourceWidth / $sourceHeight

if (-not $DryRun) {
	if (-not (Test-Path -LiteralPath $coverDir)) { New-Item -ItemType Directory -Path $coverDir | Out-Null }
	$canvas = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
	$graphics = [System.Drawing.Graphics]::FromImage($canvas)
	$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
	$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
	$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
	$graphics.DrawImage($source, 0, 0, $targetWidth, $targetHeight)
	$graphics.Dispose()
	$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
	$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
	$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$CoverQuality)
	$canvas.Save($coverPath, $codec, $encoderParams)
	$canvas.Dispose()
}
$source.Dispose()
Remove-Item -LiteralPath $tmpPath -Force -ErrorAction SilentlyContinue

# --- placement ------------------------------------------------------------------
$afterIndex = -1
if ($PSBoundParameters.ContainsKey('After') -and $After.Trim().Length -gt 0) {
	$needle = $After.Trim()
	for ($i = 0; $i -lt $blocks.Count; $i++) {
		$blockTitle = Get-BlockField $blocks[$i] 'title'
		$blockUrl = Get-BlockField $blocks[$i] 'ogUrl'
		if ($blockTitle -ieq $needle -or ($blockUrl -ne '' -and $blockUrl -like "*$needle*")) {
			$afterIndex = $i
			break
		}
	}
	if ($afterIndex -lt 0) {
		Write-Output "ANCHOR NOT FOUND: '$After' matches no title or URL. Current shelf:"
		for ($i = 0; $i -lt $blocks.Count; $i++) {
			Write-Output ("  {0,2}. {1}" -f ($i + 1), (Get-BlockField $blocks[$i] 'title'))
		}
		exit 3
	}
}
else {
	$afterIndex = $blocks.Count - 1
}

$anchorTitle = Get-BlockField $blocks[$afterIndex] 'title'
$position = $afterIndex + 2
$nextTitle = if ($position -le $blocks.Count) { Get-BlockField $blocks[$position - 1] 'title' } else { '(end of shelf)' }

# --- report ---------------------------------------------------------------------
$cropNote = 'ok: 2:3 frame trims under 4% of the width'
if ([Math]::Abs($ratio - 1) -lt 0.05) {
	$cropNote = 'WARNING: square scan - object-cover crops ~33% of the width; check the title block survives with read_image'
}
elseif ([Math]::Abs($ratio - (2 / 3)) -gt 0.08) {
	$cropNote = ('WARNING: aspect {0:N2} vs frame 0.667 - object-cover crops the sides noticeably' -f $ratio)
}

Write-Output "SUBJECT   $Subject"
Write-Output "TITLE     $title"
Write-Output "SUBTITLE  $(if ($subtitle) { $subtitle } else { '-' })"
Write-Output "ISBN      $(if ($isbn) { $isbn } else { '-' })"
Write-Output "PRESS     $(if ($press) { "$press $year" } else { '-' })"
Write-Output "COVER     $(if ($DryRun) { "(dry run, would write) " })$coverPath"
Write-Output "SOURCE    ${sourceWidth}x${sourceHeight} -> ${targetWidth}x${targetHeight}"
Write-Output "CROP      $cropNote"
Write-Output ''
Write-Output 'YAML'
Write-Output "- id: `"$(if ($isbn) { $isbn } else { $coverName })`""
Write-Output "  title: `"$title`""
Write-Output "  ogUrl: `"$subjectUrl`""
Write-Output "  ogImage: `"../assets/books/$coverName.jpg`""
Write-Output ''
Write-Output "INSERT    after `"$anchorTitle`" -> position $position of $($blocks.Count + 1)"
Write-Output "NEXT      $nextTitle"
if ($DryRun) { Write-Output 'DRY RUN   no files written' }
exit 0
