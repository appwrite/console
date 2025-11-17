#!/bin/sh
set -e

# Regenerate env.js from runtime PUBLIC_ environment variables

echo "========================================="
echo "Regenerating env.js from environment variables..."
echo "========================================="

# Check if any PUBLIC_ env vars exist
public_vars=$(printenv | grep '^PUBLIC_' | awk -F= '{print $1}' | sort)

if [ -z "$public_vars" ]; then
    echo "⚠ WARNING: No PUBLIC_ environment variables found!"
    echo "The application may not work correctly."
    echo "Expected variables like:"
    echo "  - PUBLIC_APPWRITE_ENDPOINT"
    echo "  - PUBLIC_CONSOLE_MODE"
    echo "  - PUBLIC_CONSOLE_PROFILE"
    echo "========================================="
fi

# Build JSON object from PUBLIC_ env vars
env_json="{"
first=true

for var in $public_vars; do
    value=$(printenv "$var")
    
    # Escape special characters for JSON
    escaped_value=$(echo "$value" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
    
    if [ "$first" = true ]; then
        first=false
    else
        env_json="$env_json,"
    fi
    
    env_json="$env_json\"$var\":\"$escaped_value\""
    echo "  ✓ $var=$value"
done

env_json="$env_json}"

# Write to env.js
# Use CONSOLE_BUILD_PATH env var if set, otherwise try common locations
if [ -n "$CONSOLE_BUILD_PATH" ]; then
    env_file="$CONSOLE_BUILD_PATH/_app/env.js"
elif [ -f "/usr/share/nginx/html/console/_app/env.js" ]; then
    env_file="/usr/share/nginx/html/console/_app/env.js"
elif [ -f "./build/_app/env.js" ]; then
    env_file="./build/_app/env.js"
elif [ -f "./_app/env.js" ]; then
    env_file="./_app/env.js"
else
    echo "⚠ Error: Cannot find env.js file. Set CONSOLE_BUILD_PATH env var to the build directory."
    echo "Searched in:"
    echo "  - /usr/share/nginx/html/console/_app/env.js"
    echo "  - ./build/_app/env.js"
    echo "  - ./_app/env.js"
    exit 1
fi

echo "Writing to: $env_file"
echo "export const env=$env_json" > "$env_file"

# Verify the file was written
if [ ! -f "$env_file" ]; then
    echo "⚠ Error: Failed to write $env_file"
    exit 1
fi

echo "✓ Successfully generated $env_file"
echo "File contents:"
cat "$env_file"

# NUKE all pre-compressed files so nginx serves fresh content
echo "Nuking all .br and .gz files..."
find /usr/share/nginx/html/console -type f \( -name "*.br" -o -name "*.gz" \) -delete
echo "✓ Nuked all compressed files"

echo "========================================="
echo "Starting nginx..."
echo "========================================="

exec "$@"