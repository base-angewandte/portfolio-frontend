build-app:
	docker build -t portfolio-build-container .; mkdir -p dist; docker run --mount type=bind,source=$(shell pwd)/dist,target=/app/dist portfolio-build-container

set-header:
	docker run --mount type=bind,source=$(shell pwd)/dist,target=/app/dist portfolio-build-container

git-update:
	if [ "$(shell whoami)" != "base" ]; then sudo -u base git pull; else git pull; fi

update: git-update build-app
