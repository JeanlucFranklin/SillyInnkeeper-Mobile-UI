@echo off

chcp 65001 >nul

setlocal EnableExtensions EnableDelayedExpansion



rem ==============================

rem SillyInnkeeper FAST start

rem - yarn preferred (else npm)

rem - installs deps with quiet flags

rem - build is checked ONLY by output paths

rem - if build outputs exist -> no build, just start

rem ==============================



set "ROOT=%~dp0"

set "CLIENT_DIR=%ROOT%client"

set "SERVER_DIR=%ROOT%server"

set "URL=http://localhost:3000/"



rem Yarn 4: disable progress bars

set "YARN_ENABLE_PROGRESS_BARS=0"



echo.

echo [1/3] Package manager...

where yarn >nul 2>nul

if %errorlevel%==0 (

  set "PM=yarn"

  echo Using yarn.

) else (

  where npm >nul 2>nul

  if not %errorlevel%==0 (

    echo ERROR: yarn and npm not found. Install Node.js/npm or yarn.

    exit /b 1

  )

  set "PM=npm"

  echo yarn not found, using npm.

)



rem Build check ONLY by output paths

set "CLIENT_BUILT=0"

if exist "%CLIENT_DIR%\dist\index.html" if exist "%CLIENT_DIR%\dist\assets" set "CLIENT_BUILT=1"



set "SERVER_BUILT=0"

if exist "%SERVER_DIR%\dist\server.js" set "SERVER_BUILT=1"



set "MODE=fast"

if "%CLIENT_BUILT%"=="0" set "MODE=setup"

if "%SERVER_BUILT%"=="0" set "MODE=setup"



echo.

echo [2/3] Installing dependencies: %MODE%...

call :ensure_deps "%CLIENT_DIR%" client %MODE%

if not %errorlevel%==0 exit /b 1

call :ensure_deps "%SERVER_DIR%" server %MODE%

if not %errorlevel%==0 exit /b 1



if /I "%MODE%"=="setup" (

  echo.

  echo [3/3] Build: dist not found...

  if "%CLIENT_BUILT%"=="0" call :run_build "%CLIENT_DIR%" client

  if not %errorlevel%==0 exit /b 1

  if "%SERVER_BUILT%"=="0" call :run_build "%SERVER_DIR%" server

  if not %errorlevel%==0 exit /b 1

) else (

  echo.

  echo [3/3] Build skipped: dist already exists.

)



echo.

echo Starting server and opening browser: %URL%

if /I "%PM%"=="yarn" (

  start "SillyInnkeeper Server" cmd /c "cd /d ""%SERVER_DIR%"" && yarn run start"

) else (

  start "SillyInnkeeper Server" cmd /c "cd /d ""%SERVER_DIR%"" && npm run start"

)



rem Small delay

ping 127.0.0.1 -n 3 >nul

start "SillyInnkeeper" "%URL%"



echo.

echo Done.

endlocal

exit /b 0



:ensure_deps

set "DIR=%~1"

set "NAME=%~2"

set "MODE=%~3"



if exist "%DIR%\node_modules" (

  echo - %NAME%: node_modules exists, skipping install.

  exit /b 0

)



echo - %NAME%: install...

pushd "%DIR%" || exit /b 1



if /I "%PM%"=="npm" (

  if /I "%MODE%"=="fast" (

    call npm install --no-save --no-audit --no-fund --loglevel=error --no-progress --omit=dev

  ) else (

    call npm install --no-save --no-audit --no-fund --loglevel=error --no-progress

  )

  if not %errorlevel%==0 (popd & exit /b 1)

  popd

  exit /b 0

)



rem yarn (client uses Yarn 4 via yarnPath, server likely Yarn 1)

for /f "delims=" %%v in ('yarn -v 2^>nul') do set "YV=%%v"

set "YMAJOR=!YV:~0,1!"



if "!YMAJOR!"=="1" (

  if /I "%MODE%"=="fast" (

    call yarn install --frozen-lockfile --production=true --non-interactive --no-progress --silent

  ) else (

    call yarn install --frozen-lockfile --non-interactive --no-progress --silent

  )

) else (

  if /I "%MODE%"=="fast" (

    call yarn install --immutable --mode=skip-build

  ) else (

    call yarn install --immutable

  )

)



if not %errorlevel%==0 (popd & exit /b 1)

popd

exit /b 0



:run_build

set "DIR=%~1"

set "NAME=%~2"



echo - %NAME%: build...

pushd "%DIR%" || exit /b 1

if /I "%PM%"=="yarn" (

  call yarn run build

) else (

  call npm run build

)

if not %errorlevel%==0 (popd & exit /b 1)

popd

exit /b 0

