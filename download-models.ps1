$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
$modelsFolder = "public/models"
New-Item -ItemType Directory -Force -Path $modelsFolder

$files = @(
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2"
)

foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $out = "$modelsFolder/$file"
    Write-Host "Downloading $out..."
    Invoke-WebRequest -Uri $url -OutFile $out
}
Write-Host "Done downloading models."
