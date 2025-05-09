@echo off
echo Setting up GCS Application Environment...

REM Create conda environment
call conda create -n gcsapp python=3.9 -y
if %ERRORLEVEL% neq 0 (
    echo Failed to create conda environment.
    pause
    exit /b 1
)

REM Activate environment
call conda activate gcsapp
if %ERRORLEVEL% neq 0 (
    echo Failed to activate conda environment.
    pause
    exit /b 1
)

REM Install required packages
call pip install flask flask-cors
if %ERRORLEVEL% neq 0 (
    echo Failed to install required packages.
    pause
    exit /b 1
)

echo.
echo Setup complete! You can now run the application with:
echo conda activate gcsapp
echo python app.py
echo.
echo Then open your browser and go to: http://localhost:5000
echo.

pause