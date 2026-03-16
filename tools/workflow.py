import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HELP = """Usage:
  python tools/workflow.py build        Build TypeScript and update JS outputs
  python tools/workflow.py serve [port] Start a local static server
"""


def run(cmd, cwd=ROOT):
  print("+", " ".join(cmd))
  return subprocess.call(cmd, cwd=str(cwd))


def build():
  pkg = ROOT / "package.json"
  if not pkg.exists():
    print("package.json not found. Run from repo root.")
    return 1
  return run(["npm", "run", "build:ts"])


def serve(port=8000):
  return run([sys.executable, "-m", "http.server", str(port)], cwd=ROOT)


def main():
  if len(sys.argv) < 2:
    print(HELP)
    return 1
  cmd = sys.argv[1]
  if cmd == "build":
    return build()
  if cmd == "serve":
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8000
    return serve(port)
  print(HELP)
  return 1


if __name__ == "__main__":
  raise SystemExit(main())
