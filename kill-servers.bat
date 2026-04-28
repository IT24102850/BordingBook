@echo off
echo Killing all Node.js processes (Frontend and Backend servers)...
taskkill /F /IM node.exe
echo All Node processes have been terminated!
pause