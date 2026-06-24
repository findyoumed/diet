# [LOG: 20260624_0915]
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$sourcePath,
        [string]$destPath,
        [int]$targetWidth,
        [int]$targetHeight,
        [bool]$cropCenter
    )

    if (-not (Test-Path $sourcePath)) {
        Write-Host "Source file not found: $sourcePath"
        return
    }

    $srcBmp = [System.Drawing.Bitmap]::FromFile($sourcePath)
    
    $srcWidth = $srcBmp.Width
    $srcHeight = $srcBmp.Height
    
    $cropX = 0
    $cropY = 0
    $cropW = $srcWidth
    $cropH = $srcHeight

    if ($cropCenter) {
        $targetRatio = $targetWidth / $targetHeight
        $srcRatio = $srcWidth / $srcHeight

        if ($srcRatio -gt $targetRatio) {
            $cropW = [int]($srcHeight * $targetRatio)
            $cropX = [int](($srcWidth - $cropW) / 2)
        } else {
            $cropH = [int]($srcWidth / $targetRatio)
            $cropY = [int](($srcHeight - $cropH) / 2)
        }
    }

    $destBmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($destBmp)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetWidth, $targetHeight)
    
    $graphics.DrawImage($srcBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $graphics.Dispose()
    $srcBmp.Dispose()

    $tempPath = $destPath + ".tmp.png"
    if (Test-Path $tempPath) { Remove-Item $tempPath -Force }
    
    $destBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()

    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    if (Test-Path $destPath) { Remove-Item $destPath -Force }
    Move-Item -Path $tempPath -Destination $destPath -Force
    Write-Host "Resized and saved: $destPath ($targetWidth x $targetHeight)"
}

$artifactsDir = "C:\Users\new01\.gemini\antigravity\brain\32ec4cb0-5ee8-481f-8757-6ae7522db32f"
$destDir = Join-Path (Get-Location).Path "images\custom"

function Get-LatestArtifact {
    param ([string]$pattern)
    $files = Get-ChildItem -Path $artifactsDir -Filter $pattern | Sort-Object LastWriteTime -Descending
    if ($files.Count -gt 0) {
        return $files[0].FullName
    }
    return $null
}

$mappings = @(
    @{ Pattern = "dieton_banner2_*.png"; DestName = "banner2.png"; W = 1200; H = 80; Crop = $true },
    @{ Pattern = "dieton_banner3_*.png"; DestName = "banner3.png"; W = 1200; H = 80; Crop = $true },
    @{ Pattern = "diet_wide_banner_new_*.png"; DestName = "wide_banner.png"; W = 826; H = 150; Crop = $true },
    @{ Pattern = "diet_middle_banner_new_*.png"; DestName = "middle_banner.png"; W = 780; H = 150; Crop = $true },
    @{ Pattern = "diet_category_icon_new_*.png"; DestName = "category_icon.png"; W = 80; H = 80; Crop = $true },
    @{ Pattern = "dieton_banner2_*.png"; DestName = "side_banner.png"; W = 250; H = 311; Crop = $true },
    @{ Pattern = "dieton_banner3_*.png"; DestName = "side_banner2.png"; W = 250; H = 311; Crop = $true },
    @{ Pattern = "dieton_banner3_*.png"; DestName = "side_banner_tall.png"; W = 239; H = 628; Crop = $true },
    @{ Pattern = "dieton_product1_*.png"; DestName = "product.png"; W = 800; H = 400; Crop = $true },
    @{ Pattern = "dieton_product2_*.png"; DestName = "product2.png"; W = 800; H = 400; Crop = $true },
    @{ Pattern = "dieton_product3_*.png"; DestName = "product3.png"; W = 800; H = 400; Crop = $true },
    @{ Pattern = "dieton_product4_*.png"; DestName = "product4.png"; W = 800; H = 400; Crop = $true },
    @{ Pattern = "dieton_product5_*.png"; DestName = "product5.png"; W = 800; H = 400; Crop = $true },
    @{ Pattern = "dieton_product6_*.png"; DestName = "product6.png"; W = 800; H = 400; Crop = $true }
)

foreach ($map in $mappings) {
    $src = Get-LatestArtifact -pattern $map.Pattern
    if ($src) {
        $dest = Join-Path $destDir $map.DestName
        Resize-Image -sourcePath $src -destPath $dest -targetWidth $map.W -targetHeight $map.H -cropCenter $map.Crop
    } else {
        Write-Host "WARNING: Could not find artifact for pattern: $($map.Pattern)"
    }
}
