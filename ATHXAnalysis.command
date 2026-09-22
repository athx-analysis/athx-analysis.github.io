#!/bin/bash
# Double-clique sur ce fichier pour lancer ATHX Analysis.
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "Installation des dépendances..."
  npm install
fi

# Libère le port 5173 s'il est déjà utilisé par un run précédent
lsof -ti:5173 | xargs kill -9 2>/dev/null

npm run dev > /tmp/athx_analysis_dev.log 2>&1 &

# Attend que le serveur soit prêt puis ouvre Safari
for i in $(seq 1 30); do
  if curl -s http://localhost:5173 > /dev/null; then
    open -a Safari http://localhost:5173
    break
  fi
  sleep 0.5
done

wait
