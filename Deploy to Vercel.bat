@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Scan Doc - деплой на Vercel
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Node.js не найден. Установите: https://nodejs.org
    pause
    exit /b 1
)

echo Шаг 1: Проверка сборки...
call npm run build
if errorlevel 1 (
    echo [ОШИБКА] Сборка не удалась.
    pause
    exit /b 1
)

echo.
echo Шаг 2: Вход в Vercel (откроется браузер)...
echo Если вы ещё не зарегистрированы - создайте бесплатный аккаунт.
echo.
call npx vercel login
if errorlevel 1 (
    echo [ОШИБКА] Не удалось войти в Vercel.
    pause
    exit /b 1
)

echo.
echo Шаг 3: Деплой в облако...
call npx vercel --prod
if errorlevel 1 (
    echo [ОШИБКА] Деплой не удался.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Готово! Ссылка на приложение выше.
echo   Сохраните её - открывайте с телефона.
echo ========================================
pause
