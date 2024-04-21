param (
    [string]$inputFile,
    [int]$pdfLevel
)

if (-not ($inputFile -and $pdfLevel)) {
    Write-Host "Usage: Extract-PDFSections.ps1 <inputFile> <pdfLevel>"
    exit 1
}

if (-not (Test-Path $inputFile -PathType Leaf)) {
    Write-Host "Error: Input file '$inputFile' not found."
    exit 1
}

$page = 0
$book = 1
$title = ""
$prevTitle = ""
$lines = & pdftk $inputFile dump_data

foreach ($line in $lines) {
    if ($line -match "^BookmarkTitle:\s+(.*)") {
        $prevTitle = $title
        $title = $matches[1] -replace ' ', '_'
    }
    elseif ($line -match "^BookmarkLevel:\s+(\d+)") {
        $level = [int]$matches[1]
    }
    elseif ($level -eq $pdfLevel -and $line -match "^BookmarkPageNumber:\s+(\d+)") {
        $start = $page
        $page = [int]$matches[1]
        if ($start -ne 0) {
            $end = $page - 1
            $book++

            $text = & 'pdftotext' -f $start -l $end $inputFile "-" 2>$null
            $text = $text -join "\n"
            $pattern = "(rzel|Module code)+\\n\\n(\S+?)(\\n\\nModul|,)"
            $_matches = [regex]::Matches($text, $pattern)
            $modulKrzl = if ($_matches.Count -gt 0) { $_matches[0].Groups[2].Value } else { "tmp" }

            $outputFile = "{0}.pdf" -f $modulKrzl
            Write-Host "Creating $outputFile"
            & pdftk $inputFile cat $start-$end output $outputFile
        }
    }
}

$text = & pdftotext -f $end -l - $inputFile "-" 2>$null
$text = $text -join "\n"
$pattern = "(rzel|Module code)+\\n\\n(\S+?)(\\n\\nModul|,)"
$_matches = [regex]::Matches($text, $pattern)
$modulKrzl = if ($_matches.Count -gt 0) { $_matches[0].Groups[2].Value } else { "tmp" }

$outputFile = "{0}.pdf" -f , $modulKrzl
Write-Host "Creating $outputFile"
& pdftk $inputFile cat $page-end output $outputFile

Write-Host "Done"
