@echo off
echo.
echo   PaperStack Setup - True North Data Strategies
echo   ==========================================
echo.
echo   Installing Python dependencies...
pip install -r requirements.txt
echo.
echo   Installing Node.js dependencies...
npm install docx
echo.
echo   Setup complete!
echo.
echo   Run: python paperstack.py
echo   Or:  python paperstack.py check
echo.
pause
