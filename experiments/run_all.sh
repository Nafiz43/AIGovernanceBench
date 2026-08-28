#!/usr/bin/env bash
# Governance-under-composition runs (E1-E4). One resumable file per host.
#
#   ./run_all.sh <shard_index> <shard_count> [threads]
#
# jackstraw:  ./run_all.sh 0 2 4
# sugaree:    ./run_all.sh 1 2 4
#
# Re-run the same command after an interruption; run.py skips finished work.
set -euo pipefail
cd "$(dirname "$0")"

SI=${1:-0}
SN=${2:-1}
TH=${3:-4}
MODEL=${MODEL:-qwen3.8:27b}
HOST=$(hostname -s)
OUT=results/raw/comp_${HOST}.jsonl
mkdir -p results/raw

python3 skillpool.py
python3 execute.py

run () {  # run <bundle> <conditions> <samples>
  echo "=== $1 ($2, $3 samples)"
  python3 run.py --model "$MODEL" --bundle "$1" --tasks 20 --samples "$3" \
    --conditions "$2" --permissive --save-text \
    --threads "$TH" --shard "${SI}/${SN}" --out "$OUT"
}

ALL=clear,Lexical,Semantic,Syntactic,Vagueness
TWO=clear,Vagueness

# E1 -- directive survival under load
for n in 3 4 6 8 10 16; do run "e1_n${n}" "$ALL" 3; done

# E2 -- conflict dose at matched load (c0 == e1_n8, already run above)
for c in 1 2 3; do run "e2_c${c}" "$ALL" 3; done

# E3 -- order effects
for p in 0 1 2 3 4 5; do run "e3_p${p}" "$TWO" 5; done

# E4 -- analyzer-guided vs random repair
run e4_guided "$ALL" 3
for r in 0 1 2; do run "e4_random${r}" "$ALL" 3; done

echo "done -> $OUT  ($(wc -l < "$OUT") records)"
