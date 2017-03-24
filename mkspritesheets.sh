set -e

function unify {
}

if command -v spass >/dev/null; then
    echo spass: found.
else
    echo ERROR: spass script is not found
    echo Visit https://github.com/aslushnikov/spritesheet-assembler
    exit 1;
fi

if [ -d large ]; then
    spass -i large -o large.svg -d large.json --padding-right 28 --padding-bottom 24
fi

if [ -d medium ]; then
    spass -i medium -o medium.svg -d medium.json --grid-cell 16x16
fi

if [ -d small ]; then
    spass -i small -o small.svg -d small.json --padding 10
fi
