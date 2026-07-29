@echo off
setlocal EnableExtensions

REM %~dp0 termina com \ — isso quebra aspas no robocopy; remover barra final
set "ORIGEM=%~dp0"
if "%ORIGEM:~-1%"=="\" set "ORIGEM=%ORIGEM:~0,-1%"

set "DEST=C:\Projetos\veiculoexterno2"
set "CAP=%DEST%\la-controle-capacitor"
set "ANDROID=%CAP%\android"

echo.
echo === L.A. Controle - Build APK ===
echo Origem: %ORIGEM%
echo Destino: %DEST%
echo.

if not exist "C:\Projetos" mkdir "C:\Projetos"

set "SKIP_COPY=0"
if /I "%ORIGEM%"=="%DEST%" set "SKIP_COPY=1"

if "%SKIP_COPY%"=="1" (
  echo [1/6] Ja esta em C:\Projetos — pulando copia.
  echo       ^(Se editou no OneDrive, rode o BAT de la ou copie antes.^)
) else (
  echo [1/6] Copiando para C:\Projetos...
  robocopy "%ORIGEM%" "%DEST%" /E /IS /IT /XF .gitignore /R:2 /W:3 /XD node_modules .git la-controle-capacitor\node_modules la-controle-capacitor\android\app\build la-controle-capacitor\android\build la-controle-capacitor\android\.gradle la-controle-capacitor\android\.idea la-controle-capacitor\www /NFL /NDL /NJH /NJS /nc /ns /np
  if errorlevel 8 goto erro
  if exist "%ORIGEM%\la-config.js" copy /Y "%ORIGEM%\la-config.js" "%DEST%\la-config.js" >nul
)
echo       Limpando cache de build antigo...
if exist "%CAP%\android\app\build" rmdir /s /q "%CAP%\android\app\build"
if exist "%CAP%\android\.gradle" rmdir /s /q "%CAP%\android\.gradle"
if exist "%CAP%\android\build" rmdir /s /q "%CAP%\android\build"
if exist "%CAP%\android\.idea" rmdir /s /q "%CAP%\android\.idea"

if not exist "%CAP%\package.json" (
  echo ERRO: la-controle-capacitor nao encontrado
  goto erro
)

cd /d "%DEST%"
if exist "package.json" (
  echo [2/6] Sincronizando CSS
  call npm run sync:assets
)

cd /d "%CAP%"

echo [3/6] npm install se precisar...
if not exist "node_modules" call npm install
if errorlevel 1 goto erro

echo [4/6] cap sync...
call npm run cap:sync
if errorlevel 1 goto erro

echo [5/6] Abrindo Android Studio...
if exist "%ProgramFiles%\Android\Android Studio\bin\studio64.exe" (
  start "" "%ProgramFiles%\Android\Android Studio\bin\studio64.exe" "%ANDROID%"
) else if exist "%LocalAppData%\Programs\Android Studio\bin\studio64.exe" (
  start "" "%LocalAppData%\Programs\Android Studio\bin\studio64.exe" "%ANDROID%"
) else (
  call npx cap open android
)

echo.
echo [6/6] Pronto!
echo.
echo IMPORTANTE — ordem no Android Studio ^(pasta C:\Projetos^):
echo   1. Feche e reabra o Studio se ja estava aberto ^(cap sync acabou de rodar^)
echo   2. Build ^> Clean Project
echo   3. Run ^(botao verde^) — NAO basta "Build completed"
echo.
echo O APK so muda de data se o Run/Rebuild gerar de novo.
echo Se a data do APK ficar igual, o app no celular tambem nao mudou.
echo.
echo APK: %ANDROID%\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
exit /b 0

:erro
echo.
echo Falhou. Feche o Android Studio e tente de novo.
pause
exit /b 1
