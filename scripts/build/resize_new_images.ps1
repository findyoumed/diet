# [LOG: 20260623_2050] PowerShell script to resize and crop newly generated AI images to exact Daedamo specs
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
    
    # Determine the cropping rectangle if requested
    $srcWidth = $srcBmp.Width
    $srcHeight = $srcBmp.Height
    
    $cropX = 0
    $cropY = 0
    $cropW = $srcWidth
    $cropH = $srcHeight

    if ($cropCenter) {
        # Calculate the aspect ratio of the target size
        $targetRatio = $targetWidth / $targetHeight
        $srcRatio = $srcWidth / $srcHeight

        if ($srcRatio -gt $targetRatio) {
            # Source is wider than target aspect ratio (crop horizontally)
            $cropW = [int]($srcHeight * $targetRatio)
            $cropX = [int](($srcWidth - $cropW) / 2)
        } else {
            # Source is taller than target aspect ratio (crop vertically)
            $cropH = [int]($srcWidth / $targetRatio)
            $cropY = [int](($srcHeight - $cropH) / 2)
        }
    }

    # Create new bitmap with target dimensions
    $destBmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($destBmp)
    
    # Set high quality rendering options
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Draw the source image (or cropped portion) onto the new bitmap
    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetWidth, $targetHeight)
    
    $graphics.DrawImage($srcBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    # Clean up graphics and source bitmap before saving
    $graphics.Dispose()
    $srcBmp.Dispose()

    # Save to a temporary path first, then overwrite
    $tempPath = $destPath + ".tmp.png"
    if (Test-Path $tempPath) { Remove-Item $tempPath -Force }
    
    # Save as PNG
    $destBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()

    # Clean up files
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    if (Test-Path $destPath) { Remove-Item $destPath -Force }
    Move-Item -Path $tempPath -Destination $destPath -Force
    Write-Host "Resized and saved: $destPath ($targetWidth x $targetHeight)"
}

$artifactsDir = "C:\Users\gram01\.gemini\antigravity-ide\brain\d269bad8-7d4a-48f2-8013-610b9cce6dab"
$destDir = "d:\work\diet\images\custom"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

# Helper function to get the latest file matching a pattern
function Get-LatestArtifact {
    param ([string]$pattern)
    $files = Get-ChildItem -Path $artifactsDir -Filter $pattern | Sort-Object LastWriteTime -Descending
    if ($files.Count -gt 0) {
        return $files[0].FullName
    }
    return $null
}

# Define mapping: Pattern -> DestFileName -> Width -> Height -> Crop
$mappings = @(
    @{ Pattern = "dieton_banner2_*.png"; DestName = "banner2.png"; W = 1200; H = 80; Crop = $true },
    @{ Pattern = "dieton_banner3_*.png"; DestName = "banner3.png"; W = 1200; H = 80; Crop = $true },
    @{ Pattern = "dieton_product2_*.png"; DestName = "product2.png"; W = 800; H = 400; Crop = $true },
    @{ Pattern = "dieton_product3_*.png"; DestName = "product3.png"; W = 800; H = 400; Crop = $true },
    @{ Pattern = "dieton_product4_*.png"; DestName = "product4.png"; W = 800; H = 400; Crop = $true },
    @{ Pattern = "dieton_product5_*.png"; DestName = "product5.png"; W = 800; H = 400; Crop = $true },
    @{ Pattern = "dieton_product6_*.png"; DestName = "product6.png"; W = 800; H = 400; Crop = $true },
    @{ Pattern = "dieton_avatar2_*.png"; DestName = "avatar2.png"; W = 40; H = 40; Crop = $true },
    @{ Pattern = "dieton_avatar3_*.png"; DestName = "avatar3.png"; W = 40; H = 40; Crop = $true },
    @{ Pattern = "dieton_avatar4_*.png"; DestName = "avatar4.png"; W = 40; H = 40; Crop = $true },
    @{ Pattern = "dieton_avatar5_*.png"; DestName = "avatar5.png"; W = 40; H = 40; Crop = $true },
    @{ Pattern = "dieton_avatar6_*.png"; DestName = "avatar6.png"; W = 40; H = 40; Crop = $true }
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
