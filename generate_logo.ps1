Add-Type -AssemblyName System.Drawing

$width = 220
$height = 84
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)

# Fill with black
$graphics.Clear([System.Drawing.Color]::Black)

# Draw text
$font = New-Object System.Drawing.Font("Arial", 36, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

$stringFormat = New-Object System.Drawing.StringFormat
$stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
$stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

$rect = New-Object System.Drawing.RectangleF(0, 0, $width, $height)
$graphics.DrawString("DietOn", $font, $brush, $rect, $stringFormat)

$outputPath = Join-Path (Get-Location) "images\custom\logo.png"
$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bmp.Dispose()
$font.Dispose()
$brush.Dispose()
$stringFormat.Dispose()

Write-Host "logo.png generated."
