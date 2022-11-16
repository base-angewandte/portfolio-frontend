build-app:
	docker build -t portfolio-frontend-build .; docker run -it --rm -v "$(shell pwd)"/.env.local:/app/.env.local -v "$(shell pwd)"/dist:/app/dist_host portfolio-frontend-build sh -c "npm run build && rm -rf /app/dist_host/* && mv /app/dist/* /app/dist_host"

git-update:
	if [ "$(shell whoami)" != "base" ]; then sudo -u base git pull; else git pull; fi

update: git-update build-app
