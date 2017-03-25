set -e

function optimizeFolder {
    if [ -d $1 ]; then
        mkdir -p svgo/$1
        svgo -q --config=svgoconfig.yml -f $1 --pretty -o svgo/$1

        mkdir -p svgo+scour/$1
        for i in svgo/$1/*.svg; do
            file=$(basename $i)
            scour $i svgo+scour/$1/$file
        done;
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
    echo SCOUR: found.
else
    echo ERROR: scour script is not found
    echo Visit https://github.com/scour-project/scour
    exit 1;
fi

optimizeFolder "small"
optimizeFolder "medium"
optimizeFolder "large"

