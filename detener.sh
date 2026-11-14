#!/usr/bin/env bash
pids=$(pgrep -f '[s]ervidor.py' || true)
if [ -z "$pids" ]; then
  echo "El servidor no está corriendo."
else
  kill $pids
  echo "Servidor detenido."
fi
