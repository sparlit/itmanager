@echo off
npm run lint
if %errorlevel% neq 0 (
    echo Lint errors found
    exit /b 1
) else (
    echo No lint errors found
    exit /b 0
)