$ErrorActionPreference = 'Stop'

$installKey = 'HKLM:\SOFTWARE\Python\PythonCore\3.14\InstallPath'
$pythonPath = (Get-ItemProperty $installKey -ErrorAction SilentlyContinue).ExecutablePath

if (-not $pythonPath -or -not (Test-Path $pythonPath)) {
  throw 'Python 3.14 was not found. Install Python 3.14, then run: python -m pip install -r backend/requirements.txt'
}

& $pythonPath -m uvicorn app.main:app --host 127.0.0.1 --port 8000
