# Simple task runner (install with: choco install just)
# or get binaries: https://github.com/casey/just

build:
    npm run build:ts

serve PORT=8000:
    python tools/workflow.py serve {{PORT}}

clean:
    - rmdir /s /q typescript\dist
