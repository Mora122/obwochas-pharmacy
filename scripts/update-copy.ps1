# Bulk copy update script for Obwocha's Pharmacy
$files = Get-ChildItem *.html | Select-Object -ExpandProperty Name

Write-Host "Updating $($files.Count) HTML files..."

# 1. JSON-LD descriptions
$oldJsonLd = '"description": "Meru''s own trusted pharmacy chain with 150+ stores nationwide."'
$newJsonLd = '"description": "Kenya''s fastest-growing online pharmacy -- quality medicines and healthcare products delivered to your door."'

Write-Host "[1/7] JSON-LD descriptions..."
foreach ($f in $files) {
    $content = Get-Content $f -Raw
    if ($content -match [regex]::Escape($oldJsonLd)) {
        $content = $content -replace [regex]::Escape($oldJsonLd), $newJsonLd
        Set-Content $f $content -NoNewline
    }
}
Write-Host "  Done"

# 2. index.html title tags
Write-Host "[2/7] Homepage title and footer..."
$idx = Get-Content "index.html" -Raw
$idx = $idx -replace '<title>Obwocha''s Pharmacy - Meru''s Own Pharmacy</title>', '<title>Obwocha''s Pharmacy -- Kenya''s Fastest-Growing Online Pharmacy</title>'
$idx = $idx -replace 'content="Obwocha''s Pharmacy - Meru''s Own Pharmacy"', 'content="Obwocha''s Pharmacy -- Kenya''s Fastest-Growing Online Pharmacy"'
$idx = $idx -replace '<small>Meru''s Own Pharmacy</small>', '<small>Kenya''s Fastest-Growing Online Pharmacy</small>'
Set-Content "index.html" $idx -NoNewline
Write-Host "  Done"

# 3. index.html meta descriptions
Write-Host "[3/7] Homepage meta descriptions..."
$idx = Get-Content "index.html" -Raw
$oldMeta = 'content="Meru''s own trusted pharmacy. Order medicines, OTC products, beauty items and supplements online with express 3-hour delivery in select areas."'
$newMeta = 'content="Kenya''s fastest-growing online pharmacy. Order medicines, OTC products, beauty items and supplements online with express 3-hour delivery in select areas."'
$idx = $idx -replace [regex]::Escape($oldMeta), $newMeta
Set-Content "index.html" $idx -NoNewline
Write-Host "  Done"

# 4. about.html body copy
Write-Host "[4/7] About page..."
$abt = Get-Content "about.html" -Raw
# Meta description
$abt = $abt -replace 'Learn about Obwocha''s Pharmacy - Meru''s largest pharmacy chain with 150\+ stores nationwide\. Quality healthcare, trusted since 2020\.', 'Learn about Obwocha''s Pharmacy -- Kenya''s fastest-growing online pharmacy. Quality healthcare, delivered to your door.'
# Body text
$abt = $abt -replace 'Obwocha''s Pharmacy was founded in 2010 with a simple mission: make quality healthcare accessible and affordable to every Kenyan. What started as a single pharmacy in Nairobi has grown into Kenya''s largest pharmacy chain with <strong>over 150 stores nationwide</strong>.', 'Obwocha''s Pharmacy started with a simple mission: make quality healthcare accessible and affordable to every Kenyan. What began as a single pharmacy has grown into Kenya''s fastest-growing online pharmacy, serving customers nationwide.'
# 150+ Stores list item
$abt = $abt -replace '<strong>150\+ Stores</strong> - Nationwide coverage in all major towns and cities', '<strong>Nationwide Delivery</strong> - Serving customers across all 47 counties in Kenya'
# Kenya's largest pharmacy team
$abt = $abt -replace 'Want to be part of Kenya''s largest pharmacy team?', 'Want to be part of Kenya''s fastest-growing pharmacy team?'
Set-Content "about.html" $abt -NoNewline
Write-Host "  Done"

# 5. store-locator.html
Write-Host "[5/7] Store Locator page..."
$sl = Get-Content "store-locator.html" -Raw
$sl = $sl -replace '150\+ stores across all 47 counties', 'serving customers across all 47 counties'
$sl = $sl -replace '150\+ stores across Kenya', 'serving customers across Kenya'
$sl = $sl -replace 'Find Obwocha''s Pharmacy locations near you. 150\+ stores across Kenya.', 'Order online from Obwocha''s Pharmacy -- delivery across Kenya. Same-day delivery in select areas.'
$sl = $sl -replace "We''re everywhere - 150\+ stores across all 47 counties", "We deliver everywhere -- across all 47 counties in Kenya"
Set-Content "store-locator.html" $sl -NoNewline
Write-Host "  Done"

# 6. faq.html, careers.html
Write-Host "[6/7] FAQ and Careers..."
$faq = Get-Content "faq.html" -Raw
$faq = $faq -replace 'We have 150\+ stores', 'We serve customers across Kenya'
Set-Content "faq.html" $faq -NoNewline

$car = Get-Content "careers.html" -Raw
$car = $car -replace 'Join Kenya''s largest pharmacy chain\. Careers at Obwocha''s Pharmacy for pharmacists', 'Join Kenya''s fastest-growing pharmacy team. Careers at Obwocha''s Pharmacy for pharmacists'
Set-Content "careers.html" $car -NoNewline
Write-Host "  Done"

# 7. index.html body features section
Write-Host "[7/7] Index body features..."
$idx = Get-Content "index.html" -Raw
$idx = $idx -replace 'From a network of over 140\+ stores across all 47 counties in Kenya', 'Delivery across all 47 counties in Kenya -- from Nairobi to your doorstep'
Set-Content "index.html" $idx -NoNewline
Write-Host "  Done"

Write-Host "=== All updates complete! ==="
