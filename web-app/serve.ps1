$port = 8080
$path = (Get-Location).Path

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Listening on http://localhost:$port/"
Write-Host "Press Ctrl+C to stop"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        $filePath = Join-Path $path $urlPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mimeType = "text/plain"
            switch ($ext) {
                ".html" { $mimeType = "text/html" }
                ".css" { $mimeType = "text/css" }
                ".js" { $mimeType = "application/javascript" }
                ".json" { $mimeType = "application/json" }
                ".png" { $mimeType = "image/png" }
                ".jpg" { $mimeType = "image/jpeg" }
                ".svg" { $mimeType = "image/svg+xml" }
            }
            
            $response.ContentType = $mimeType
            
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
        }
        
        $response.Close()
    }
}
finally {
    $listener.Stop()
}
