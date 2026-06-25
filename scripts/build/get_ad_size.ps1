curl.exe -s https://image.dieton.com/images/staticBanner/ad_bottom_right2_ko.jpg -o temp_ad.jpg
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("temp_ad.jpg")
Write-Host "$($img.Width)x$($img.Height)"
$img.Dispose()
Remove-Item temp_ad.jpg
