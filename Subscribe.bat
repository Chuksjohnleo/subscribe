@echo off
echo Starting the server...
start npm start
echo Server has started.
timeout /t 20
echo Opening browser...
start "Subscribe" "http://localhost:4001"
echo Browser has been opened. Good luck, Chuksjohnleo.
