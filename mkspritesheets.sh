set -e

if command -v spass >/dev/null; then
    echo SPASS: found.
else
    echo ERROR: spass script is not found
    echo Visit https://github.com/aslushnikov/spritesheet-assembler
    exit 1;
fi

if [[ $# != 1 ]]; then
    echo "Not enough arguments!" >&2
    echo "Usage: bash mkspritesheets.sh [iconsdirectory]" >&2
    exit 1
fi

dir=$1

if [ -d large ]; then
    spass -i $dir/large -o large.svg -d large.json --padding-right 28 --padding-bottom 24
fi

if [ -d medium ]; then
    spass -i $dir/medium -o medium.svg -d medium.json --grid-cell 16x16
fi

if [ -d small ]; then
    spass -i $dir/small -o small.svg -d small.json --padding 10
fi
