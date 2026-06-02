#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

print_help() {
  cat <<'EOF'
Docker Mano a Mano.

Opciones:
--build               Realizar 'docker compose up' con opcion --build
--build-fresh-db      Igual que --build pero borra el volumen de MySQL antes
                      (recrea usuario/base segun Backend/.env; pierde datos DB locales)
--up                  Realizar 'docker compose up' sin opcion --build
--list                Revisar contenedores levantados
--stop                Detener servicios
--down                Destruir servicios
--up-interface        Levantar y mostrar solo IP local asociada
--help                Obtener Ayuda
-h                    Igual que --help
EOF
}

ensure_env() {
  if [ ! -f "Backend/.env" ]; then
    cp "Backend/.env_modelo" "Backend/.env"
  fi
}

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "No se encontro Docker en PATH."
    echo "Instala/abre Docker y vuelve a intentar."
    exit 1
  fi
}

compose_cmd() {
  check_docker
  if docker compose ps >/dev/null 2>&1; then
    docker compose "$@"
  else
    sudo docker compose "$@"
  fi
}

docker_volume_rm() {
  local vol="$1"
  if docker volume rm "$vol" 2>/dev/null; then
    return 0
  fi
  if sudo docker volume rm "$vol" 2>/dev/null; then
    return 0
  fi
  return 1
}

run_build() {
  ensure_env
  compose_cmd up --build -d --remove-orphans
  show_local_urls
}

mysql_data_volume_name() {
  local base="${COMPOSE_PROJECT_NAME:-}"
  if [[ -z "$base" ]]; then
    base="$(basename "$PROJECT_DIR")"
  fi
  echo "${base}_mysql_data"
}

run_build_fresh_db() {
  ensure_env
  local vol
  vol="$(mysql_data_volume_name)"
  echo "Deteniendo contenedores..."
  compose_cmd down --remove-orphans
  if docker_volume_rm "$vol"; then
    echo "Volumen MySQL eliminado: $vol (MySQL se inicializara de nuevo con Backend/.env)."
  else
    echo "No se pudo borrar el volumen '$vol' (no existia o esta en uso). Se continua igualmente."
  fi
  compose_cmd up --build -d --remove-orphans
  show_local_urls
}

run_up() {
  ensure_env
  compose_cmd up -d --remove-orphans
  show_local_urls
}

run_list() {
  ensure_env
  compose_cmd ps
}

run_stop() {
  ensure_env
  compose_cmd stop
}

run_down() {
  ensure_env
  compose_cmd down --remove-orphans
}

show_local_urls() {
  echo "Frontend: http://localhost:4200"
  echo "Backend:  http://localhost:8000/api/"
}

run_up_interface() {
  ensure_env
  compose_cmd up -d --remove-orphans
  show_local_urls
}

pause_menu() {
  echo
  read -r -p "Presiona Enter para continuar..." _
}

show_menu() {
  clear
  echo "Docker Mano a Mano."
  echo
  echo "Opciones:"
  echo "[1] --build              Levantar con build"
  echo "[1b] --build-fresh-db     Build y DB MySQL nueva (borra datos locales MySQL)"
  echo "[2] --up                 Levantar sin build"
  echo "[3] --list               Revisar contenedores"
  echo "[4] --stop               Detener servicios"
  echo "[5] --down               Destruir servicios"
  echo "[6] --up-interface       Levantar y mostrar interfaces"
  echo "[7] --help               Ver ayuda"
  echo "[0] Salir"
  echo
}

menu_loop() {
  while true; do
    show_menu
    read -r -p "Selecciona una opcion y presiona Enter: " menu_option
    case "${menu_option}" in
      1) run_build; pause_menu ;;
      1b|1B) run_build_fresh_db; pause_menu ;;
      2) run_up; pause_menu ;;
      3) run_list; pause_menu ;;
      4) run_stop; pause_menu ;;
      5) run_down; pause_menu ;;
      6) run_up_interface; pause_menu ;;
      7) print_help; pause_menu ;;
      0) break ;;
      *) echo "Opcion no valida."; pause_menu ;;
    esac
  done
}

if [[ $# -eq 0 ]]; then
  menu_loop
  exit 0
fi

case "${1:-}" in
  --build)
    run_build
    ;;
  --build-fresh-db)
    run_build_fresh_db
    ;;
  --up)
    run_up
    ;;
  --list)
    run_list
    ;;
  --stop)
    run_stop
    ;;
  --down)
    run_down
    ;;
  --up-interface)
    run_up_interface
    ;;
  --help|-h)
    print_help
    ;;
  *)
    echo "Opcion no valida: $1"
    echo
    print_help
    exit 1
    ;;
esac
