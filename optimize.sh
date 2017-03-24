set -e

function optimizeFolder {
    if [ -d $1 ]; then
        mkdir -p minimized/$1
        for i in $1/*.svg; do
            scour $i minimized/$i
        done;
        svgo -q --config=svgoconfig.yml -f minimized/$1 --pretty
    fi
}

if command -v svgo >/dev/null; then
    echo SVGO: found.
else
    echo ERROR: svgo script is not found
    echo Visit https://github.com/svg/svgo
    exit 1;
fi

if command -v scour >/dev/null; then
    echo SVGO: found.
else
    echo ERROR: svgo script is not found
    echo Visit https://github.com/scour-project/scour
    exit 1;
fi

optimizeFolder "small/"
optimizeFolder "medium/"
optimizeFolder "large/"

