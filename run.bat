@echo off
echo Starting GCS Application...

REM Activate environment
call conda activate gcsapp

REM Run the application
python app.py

pause