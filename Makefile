build-app:
	docker build -t portfolio-build-container .; docker run -it -v "$(shell pwd)"/dist:/app/dist_host portfolio-build-container sh -c "npm run build && rm -rf /app/dist_host/* && mv /app/dist/* /app/dist_host"

git-update:
	if [ "$(shell whoami)" != "base" ]; then sudo -u base git pull; else git pull; fi

update: git-update build-app
