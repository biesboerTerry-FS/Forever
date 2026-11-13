#!/usr/bin/env bash
# Manage the Forever stack as launchd user services so the apps stay running
# in the background (and restart if they crash) without a terminal open.
#
#   ./scripts/services.sh start     # start backend + storefront + admin
#   ./scripts/services.sh stop      # stop all three
#   ./scripts/services.sh restart
#   ./scripts/services.sh status
#   ./scripts/services.sh logs      # tail all three logs
#
# Ports: backend 4001 · storefront 5178 · admin 5179
set -euo pipefail

BASE="$(cd "$(dirname "$0")/.." && pwd)"
AGENTS="$HOME/Library/LaunchAgents"
DOMAIN="gui/$(id -u)"
NODE="$(command -v node)"
NPM="$(command -v npm)"
LOG_DIR="${TMPDIR:-/tmp}/forever-logs"
mkdir -p "$AGENTS" "$LOG_DIR"

labels=(
	"com.forever.backend"
	"com.forever.frontend"
	"com.forever.admin"
)

write_plist() {
	local label="$1" workdir="$2" out="$3" err="$4"
	shift 4
	local args_xml=""
	for arg in "$@"; do
		args_xml+="        <string>${arg}</string>"$'\n'
	done
	cat >"$AGENTS/${label}.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${label}</string>
    <key>ProgramArguments</key>
    <array>
${args_xml}    </array>
    <key>WorkingDirectory</key>
    <string>${workdir}</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
        <key>NODE_ENV</key>
        <string>development</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${out}</string>
    <key>StandardErrorPath</key>
    <string>${err}</string>
</dict>
</plist>
EOF
}

bootout_all() {
	for label in "${labels[@]}"; do
		launchctl bootout "${DOMAIN}/${label}" 2>/dev/null || true
	done
}

start() {
	# Free our ports if an older, unmanaged process is holding them.
	for port in 4001 5178 5179; do
		if command -v lsof >/dev/null; then
			pids="$(lsof -ti ":${port}" 2>/dev/null || true)"
			[ -n "$pids" ] && kill $pids 2>/dev/null || true
		fi
	done
	sleep 1

	write_plist "com.forever.backend" "$BASE/backend" \
		"$LOG_DIR/backend.log" "$LOG_DIR/backend.err" "$NODE" "server.js"
	write_plist "com.forever.frontend" "$BASE/frontend" \
		"$LOG_DIR/frontend.log" "$LOG_DIR/frontend.err" "$NPM" "run" "dev"
	write_plist "com.forever.admin" "$BASE/admin" \
		"$LOG_DIR/admin.log" "$LOG_DIR/admin.err" "$NPM" "run" "dev"

	bootout_all
	for label in "${labels[@]}"; do
		launchctl bootstrap "$DOMAIN" "$AGENTS/${label}.plist"
	done
	echo "Forever services started:"
	echo "  storefront → http://localhost:5178"
	echo "  admin      → http://localhost:5179"
	echo "  API        → http://localhost:4001"
}

stop() {
	bootout_all
	echo "Forever services stopped."
}

status() {
	for label in "${labels[@]}"; do
		if launchctl print "${DOMAIN}/${label}" >/dev/null 2>&1; then
			state="$(launchctl print "${DOMAIN}/${label}" | awk -F' = ' '/state =/{print $2; exit}')"
			echo "${label}: ${state:-loaded}"
		else
			echo "${label}: not loaded"
		fi
	done
}

logs() {
	tail -n 40 -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log" "$LOG_DIR/admin.log"
}

case "${1:-start}" in
start) start ;;
stop) stop ;;
restart)
	stop
	start
	;;
status) status ;;
logs) logs ;;
*)
	echo "Usage: $0 {start|stop|restart|status|logs}" >&2
	exit 1
	;;
esac
