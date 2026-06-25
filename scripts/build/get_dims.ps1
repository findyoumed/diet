Add-Type -AssemblyName System.Drawing
$wc = New-Object System.Net.WebClient
$urls = @(
    'https://image.dieton.com/images/staticBanner/ad_search_pop_banner_pc_ko.jpg',
    'https://image.dieton.com/images/staticBanner/ad_top_right_banner_rand2_ko.jpg',
    'https://image.dieton.com/images/staticBanner/pc_thumb_graftover_ko.jpg',
    'https://image.dieton.com/images/staticBanner/ad_bottom_right2_ko.jpg'
)
foreach ($u in $urls) {
    $s = $wc.OpenRead($u)
    $i = [System.Drawing.Image]::FromStream($s)
    Write-Host ($u + ': ' + $i.Width + 'x' + $i.Height)
    $i.Dispose()
    $s.Close()
}
