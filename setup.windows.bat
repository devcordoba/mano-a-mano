@echo off
setlocal

cd /d %~dp0

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

if "%OPTION%"=="--build" (
  call :runBuild
  goto :end
)

if "%OPTION%"=="--up" (
  call :runUp
  goto :end
)

if "%OPTION%"=="--list" (
  call :runList
  goto :end
)

if "%OPTION%"=="--stop" (
  call :runStop
  goto :end
)

if "%OPTION%"=="--down" (
  call :runDown
  goto :end
)

if "%OPTION%"=="--up-interface" (
  call :runUpInterface
  goto :end
)

if "%OPTION%"=="--help" (
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
echo [1] --build         Levantar con build
echo [2] --up            Levantar sin build
echo [3] --list          Revisar contenedores
echo [4] --stop          Detener servicios
echo [5] --down          Destruir servicios
echo [6] --up-interface  Levantar y mostrar interfaces
echo [7] --help          Ver ayuda
echo [0] Salir
echo.
echo.
set "MENU_OPTION="
set /p MENU_OPTION=Selecciona una opcion y presiona Enter: 

if "%MENU_OPTION%"=="1" (
  call :runBuild
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
if not exist Backend\.env (
  copy Backend\.env_modelo Backend\.env >nul
)
exit /b 0

:runBuild
docker compose up --build -d
if errorlevel 1 exit /b %errorlevel%
echo Frontend: http://localhost:4200
echo Backend:  http://localhost:8000/api/health/
exit /b %errorlevel%

:runUp
docker compose up -d
exit /b %errorlevel%

:runList
docker compose ps
exit /b %errorlevel%

:runStop
docker compose stop
exit /b %errorlevel%

:runDown
docker compose down
exit /b %errorlevel%

:runUpInterface
docker compose up -d
echo Frontend: http://localhost:4200
echo Backend:  http://localhost:8000/api/health/
exit /b %errorlevel%

:printHelp
echo Docker Mano a Mano.
echo.
echo Opciones:
echo --build               Realizar 'docker compose up' con opcion --build
echo --up                  Realizar 'docker compose up' sin opcion --build
echo --list                Revisar contenedores levantados
echo --stop                Detener servicios
echo --down                Destruir servicios
echo --up-interface        Levantar y mostrar solo IP local asociada
echo --help                Obtener Ayuda
echo.
exit /b 0

:end
endlocal
