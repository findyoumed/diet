# [LOG: 20260624_0857]
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

$destDir = Join-Path (Get-Location).Path "images\custom"

Resize-Image -sourcePath "$destDir\logo.png" -destPath "$destDir\logo.png" -targetWidth 180 -targetHeight 36 -cropCenter $true
Resize-Image -sourcePath "$destDir\icon.png" -destPath "$destDir\icon.png" -targetWidth 128 -targetHeight 128 -cropCenter $false

$banners = Get-ChildItem -Path $destDir -Filter "banner*.png"
foreach ($b in $banners) {
    Resize-Image -sourcePath $b.FullName -destPath $b.FullName -targetWidth 1200 -targetHeight 80 -cropCenter $true
}

$products = Get-ChildItem -Path $destDir -Filter "product*.png"
foreach ($p in $products) {
    Resize-Image -sourcePath $p.FullName -destPath $p.FullName -targetWidth 800 -targetHeight 400 -cropCenter $true
}

$avatars = Get-ChildItem -Path $destDir -Filter "avatar*.png"
foreach ($a in $avatars) {
    Resize-Image -sourcePath $a.FullName -destPath $a.FullName -targetWidth 40 -targetHeight 40 -cropCenter $true
}
