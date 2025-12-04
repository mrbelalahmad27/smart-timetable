@echo off
echo ==========================================
echo      FIXING CONNECTION ISSUES
echo ==========================================
echo.
echo This script will open Port 5173 in your Firewall
echo so your phone can connect.
echo.
echo Requesting Administrator privileges...
echo.

:: Check for permissions
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"

:: If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

echo Adding Firewall Rule...
netsh advfirewall firewall delete rule name="Vite Dev Server" >nul
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173 profile=any

echo.
echo ==========================================
echo      FIREWALL RULE ADDED!
echo ==========================================
echo.
echo Now try connecting on your phone to:
echo.
echo Option 1 (If connected to same WiFi):
echo https://172.16.126.150:5173
echo.
echo Option 2 (If connected to PC Hotspot):
echo https://192.168.137.1:5173
echo.
pause
