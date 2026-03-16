# Makefile for Unix-like shells

build:
	npm run build:ts

serve:
	python tools/workflow.py serve 8000

clean:
	rm -rf typescript/dist
