#!/bin/bash

# Check for BOM in staged files
echo "Checking for BOM in staged files..."

# Get staged files with specific extensions
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E "\.(js|ts|json|md|mjs)$")

for file in $staged_files; do
    if [ -f "$file" ]; then
        # Check for UTF-8 BOM (EF BB BF)
        if [ "$(head -c 3 "$file" | od -t x1 -N 3 | head -1 | awk '{print $2$3$4}')" = "efbbbf" ]; then
            echo "ERROR: BOM detected in $file" >&2
            echo "Please remove BOM from the file before committing." >&2
            exit 1
        fi
    fi
done

echo "No BOM detected in staged files."
npx lint-staged