#!/bin/bash
# Install vercel-email-debug-skill for Claude Code
# Usage: ./install.sh [--platform claude|cursor|copilot|all]

set -e

SKILL_NAME="vercel-email-debug-skill"
SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
DEST_DIR=""
PLATFORM=""

detect_platform() {
    if [ -n "$PLATFORM" ]; then return; fi

    if [ -d "$HOME/.claude/skills" ] || command -v claude &> /dev/null; then
        PLATFORM="claude"
    elif [ -d "$HOME/.cursor" ]; then
        PLATFORM="cursor"
    elif [ -d "$HOME/.github/skills" ]; then
        PLATFORM="copilot"
    else
        PLATFORM="claude"  # Default
    fi
}

install_claude() {
    DEST_DIR="$HOME/.claude/skills/$SKILL_NAME"
    mkdir -p "$(dirname "$DEST_DIR")"
    rm -rf "$DEST_DIR"
    cp -r "$SKILL_DIR" "$DEST_DIR"
    chmod +x "$DEST_DIR/scripts/"*.py 2>/dev/null || true
    echo "✅ Installed for Claude Code: $DEST_DIR"
}

install_cursor() {
    DEST_DIR="$HOME/.cursor/rules/$SKILL_NAME"
    mkdir -p "$(dirname "$DEST_DIR")"
    rm -rf "$DEST_DIR"
    cp -r "$SKILL_DIR" "$DEST_DIR"
    echo "✅ Installed for Cursor: $DEST_DIR"
}

install_copilot() {
    DEST_DIR="$HOME/.github/skills/$SKILL_NAME"
    mkdir -p "$(dirname "$DEST_DIR")"
    rm -rf "$DEST_DIR"
    cp -r "$SKILL_DIR" "$DEST_DIR"
    echo "✅ Installed for GitHub Copilot: $DEST_DIR"
}

install_all() {
    install_claude
    install_cursor
    install_copilot
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --platform PLATFORM    Install for specific platform (claude, cursor, copilot)"
    echo "  --all                  Install for all platforms"
    echo "  --help                 Show this help"
    echo ""
    echo "Platforms:"
    echo "  claude   - Claude Code (default)"
    echo "  cursor   - Cursor AI"
    echo "  copilot  - GitHub Copilot"
}

# Parse arguments
case "${1:-}" in
    --platform)
        PLATFORM="${2:-}"
        if [ -z "$PLATFORM" ]; then
            echo "Error: --platform requires an argument"
            show_help
            exit 1
        fi
        ;;
    --all)
        detect_platform
        install_all
        exit 0
        ;;
    --help|-h)
        show_help
        exit 0
        ;;
    "")
        detect_platform
        ;;
    *)
        echo "Unknown option: $1"
        show_help
        exit 1
        ;;
esac

# Install for detected or specified platform
case "$PLATFORM" in
    claude)
        install_claude
        ;;
    cursor)
        install_cursor
        ;;
    copilot)
        install_copilot
        ;;
    *)
        echo "Error: Unknown platform '$PLATFORM'"
        show_help
        exit 1
        ;;
esac

echo ""
echo "📖 To use, type in Claude Code:"
echo "   /vercel-email-debug-skill Email stopped working after deployment"