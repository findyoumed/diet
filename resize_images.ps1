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
    if (Test-Path $tempPath) { Remove-Item $tempPath }
    
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

$destDir = "d:\work\diet\images\custom"

Resize-Image -sourcePath "$destDir\logo.png" -destPath "$destDir\logo.png" -targetWidth 180 -targetHeight 36 -cropCenter $true
Resize-Image -sourcePath "$destDir\banner.png" -destPath "$destDir\banner.png" -targetWidth 1200 -targetHeight 80 -cropCenter $true
Resize-Image -sourcePath "$destDir\product.png" -destPath "$destDir\product.png" -targetWidth 800 -targetHeight 400 -cropCenter $true
Resize-Image -sourcePath "$destDir\avatar.png" -destPath "$destDir\avatar.png" -targetWidth 40 -targetHeight 40 -cropCenter $true
Resize-Image -sourcePath "$destDir\icon.png" -destPath "$destDir\icon.png" -targetWidth 128 -targetHeight 128 -cropCenter $false
