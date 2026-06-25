curl.exe -s https://image.dieton.com/images/staticBanner/pc_thumb_graftover_ko.jpg -o temp.jpg
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("temp.jpg")
Write-Host "$($img.Width)x$($img.Height)"
$img.Dispose()
Remove-Item temp.jpg
