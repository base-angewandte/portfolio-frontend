build-app:
	docker build -t build-container .; mkdir -p dist; docker run --rm --mount type=bind,source=$(shell pwd)/dist,target=/app/dist build-container

set-header: build-app

git-update:
	if [ "$(shell whoami)" != "base" ]; then sudo -u base git pull; else git pull; fi

update: git-update build-app
