@echo off
setlocal EnableExtensions

cd /d "%~dp0"

where docker >nul 2>&1
if errorlevel 1 (
  echo No se encontro Docker en PATH.
  echo Instala y abre Docker Desktop antes de ejecutar este script.
  pause
  exit /b 1
)

call :ensureEnv

set "OPTION=%~1"
if "%OPTION%"=="" goto :menu

if /i "%OPTION%"=="--build" (
  call :runBuild
  goto :end
)

if /i "%OPTION%"=="--build-fresh-db" (
  call :runBuildFreshDb
  goto :end
)

if /i "%OPTION%"=="--up" (
  call :runUp
  goto :end
)

if /i "%OPTION%"=="--list" (
  call :runList
  goto :end
)

if /i "%OPTION%"=="--stop" (
  call :runStop
  goto :end
)

if /i "%OPTION%"=="--down" (
  call :runDown
  goto :end
)

if /i "%OPTION%"=="--up-interface" (
  call :runUpInterface
  goto :end
)

if /i "%OPTION%"=="--help" (
  call :printHelp
  goto :end
)

if /i "%OPTION%"=="-h" (
  call :printHelp
  goto :end
)

echo Opcion no valida: %OPTION%
echo.
call :printHelp
exit /b 1

:menu
cls
echo Docker Mano a Mano.
echo.
echo Opciones:
echo [1] --build              Levantar con build
echo [1b] --build-fresh-db    Build y DB MySQL nueva ^(borra datos locales MySQL^)
echo [2] --up                 Levantar sin build
echo [3] --list               Revisar contenedores
echo [4] --stop               Detener servicios
echo [5] --down               Destruir servicios
echo [6] --up-interface       Levantar y mostrar interfaces
echo [7] --help               Ver ayuda
echo [0] Salir
echo.
set "MENU_OPTION="
set /p MENU_OPTION=Selecciona una opcion y presiona Enter: 

if "%MENU_OPTION%"=="1" (
  call :runBuild
  goto :menuPause
)
if /i "%MENU_OPTION%"=="1b" (
  call :runBuildFreshDb
  goto :menuPause
)
if "%MENU_OPTION%"=="2" (
  call :runUp
  goto :menuPause
)
if "%MENU_OPTION%"=="3" (
  call :runList
  goto :menuPause
)
if "%MENU_OPTION%"=="4" (
  call :runStop
  goto :menuPause
)
if "%MENU_OPTION%"=="5" (
  call :runDown
  goto :menuPause
)
if "%MENU_OPTION%"=="6" (
  call :runUpInterface
  goto :menuPause
)
if "%MENU_OPTION%"=="7" (
  call :printHelp
  goto :menuPause
)
if "%MENU_OPTION%"=="0" goto :end

echo Opcion no valida.
goto :menuPause

:menuPause
echo.
pause
goto :menu

:ensureEnv
if not exist "Backend\.env" (
  copy /Y "Backend\.env_modelo" "Backend\.env" >nul
)
exit /b 0

:showLocalUrls
echo Frontend: http://localhost:4200
echo Backend:  http://localhost:8000/api/
exit /b 0

:mysqlDataVolumeName
if defined COMPOSE_PROJECT_NAME (
  set "MYSQLVOL=%COMPOSE_PROJECT_NAME%_mysql_data"
) else (
  for %%I in ("%CD%") do set "MYSQLVOL=%%~nxI_mysql_data"
)
exit /b 0

:runBuild
call :ensureEnv
docker compose up --build -d
if errorlevel 1 exit /b %errorlevel%
call :showLocalUrls
exit /b 0

:runBuildFreshDb
call :ensureEnv
call :mysqlDataVolumeName
echo Deteniendo contenedores...
docker compose down
docker volume rm "%MYSQLVOL%" >nul 2>&1
if errorlevel 1 (
  echo No se pudo borrar el volumen "%MYSQLVOL%" ^(no existia o esta en uso^). Se continua igualmente.
) else (
  echo Volumen MySQL eliminado: %MYSQLVOL% ^(MySQL se inicializara de nuevo con Backend\.env^).
)
docker compose up --build -d
if errorlevel 1 exit /b %errorlevel%
call :showLocalUrls
exit /b 0

:runUp
call :ensureEnv
docker compose up -d
if errorlevel 1 exit /b %errorlevel%
call :showLocalUrls
exit /b 0

:runList
call :ensureEnv
docker compose ps
exit /b %errorlevel%

:runStop
call :ensureEnv
docker compose stop
exit /b %errorlevel%

:runDown
call :ensureEnv
docker compose down
exit /b %errorlevel%

:runUpInterface
call :ensureEnv
docker compose up -d
if errorlevel 1 exit /b %errorlevel%
call :showLocalUrls
exit /b 0

:printHelp
echo Docker Mano a Mano.
echo.
echo Opciones:
echo --build               Realizar 'docker compose up' con opcion --build
echo --build-fresh-db      Igual que --build pero borra el volumen de MySQL antes
echo                       ^(recrea usuario/base segun Backend\.env; pierde datos DB locales^)
echo --up                  Realizar 'docker compose up' sin opcion --build
echo --list                Revisar contenedores levantados
echo --stop                Detener servicios
echo --down                Destruir servicios
echo --up-interface        Levantar y mostrar solo IP local asociada
echo --help                Obtener Ayuda
echo -h                    Igual que --help
echo.
exit /b 0

:end
endlocal
