Add-Type -AssemblyName System.Drawing
$wc = New-Object System.Net.WebClient
$stream = $wc.OpenRead("https://image.daedamo.com/images/img/mainSlideBanner/jwDucray/bg_2026_pc.jpg")
$img = [System.Drawing.Image]::FromStream($stream)
Write-Host ($img.Width.ToString() + 'x' + $img.Height.ToString())
$img.Dispose()
$stream.Close()
