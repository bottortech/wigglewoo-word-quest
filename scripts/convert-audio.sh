#!/usr/bin/env bash
# Convert WiggleWoo VO deliverables (WAV) → AAC/m4a, normalize filenames.
# Source:  audio-originals/*.wav
# Output:  public/assets/audio/{words,phonetics,phrases,events}/<name>.m4a

set -euo pipefail

SRC="audio-originals"
DST="public/assets/audio"

mkdir -p "$DST/words" "$DST/phonetics" "$DST/phrases" "$DST/events"

converted=0
skipped=0

for f in "$SRC"/*.wav; do
  [ -e "$f" ] || continue
  base=$(basename "$f" .wav)

  out=""
  case "$base" in
    "Phonetic - "*)
      # "Phonetic - A" → a ; skip _2 alternates (only _1 or plain)
      letter="${base#Phonetic - }"
      if [[ "$letter" == *"_2" ]]; then
        skipped=$((skipped + 1))
        continue
      fi
      letter="${letter%_1}"
      letter=$(echo "$letter" | tr '[:upper:]' '[:lower:]')
      out="$DST/phonetics/${letter}.m4a"
      ;;
    *_1)
      # Phrase (capitalized or multi-word ending in _1)
      clean="${base%_1}"
      clean=$(echo "$clean" | tr '[:upper:]' '[:lower:]')
      clean="${clean//\'/}"
      clean="${clean// /-}"
      out="$DST/phrases/${clean}.m4a"
      ;;
    celebrate_* | decode_* | discover_* | mini_* | onboard_* | placement_* | trophy_* | wrong_*)
      clean="${base//_/-}"
      out="$DST/events/${clean}.m4a"
      ;;
    *)
      # Per-word VO — already lowercase
      out="$DST/words/${base}.m4a"
      ;;
  esac

  if [ -f "$out" ]; then
    skipped=$((skipped + 1))
    continue
  fi

  afconvert -f m4af -d aac -b 64000 -c 1 "$f" "$out" >/dev/null 2>&1
  converted=$((converted + 1))
done

echo "converted=$converted skipped=$skipped"
echo "words:     $(ls "$DST/words" | wc -l | tr -d ' ')"
echo "phonetics: $(ls "$DST/phonetics" | wc -l | tr -d ' ')"
echo "phrases:   $(ls "$DST/phrases" | wc -l | tr -d ' ')"
echo "events:    $(ls "$DST/events" | wc -l | tr -d ' ')"
