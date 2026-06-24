@echo off
:: [LOG: 20260622_1730]
echo ==========================================
echo   Git Pull Helper Script (DietOn)
echo ==========================================
echo.

:: Check if .git folder exists to decide clone or pull
if not exist ".git" (
    echo [Info] Repository not initialized here. Cloning from GitHub...
    git clone https://github.com/findyoumed/diet.git .
) else (
    echo [Step 1] Setting remote URL to findyoumed/diet...
    git remote set-url origin https://github.com/findyoumed/diet.git
    
    echo.
    echo [Step 2] Fetching updates from remote...
    git fetch origin
    
    echo.
    echo [Step 3] Pulling latest changes from main branch...
    git pull origin main
)

echo.
echo ==========================================
echo   Git Pull Process Completed!
echo ==========================================
