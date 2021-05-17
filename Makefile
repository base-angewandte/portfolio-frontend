build-app:
	docker run -it -v "$(shell pwd)"/dist:/app/dist_host baseangewandte/portfolio-frontend-build:1.1.2 sh -c "npm run build && rm -rf /app/dist_host/* && mv /app/dist/* /app/dist_host"

build-app-local:
	docker build -t portfolio-frontend-build .; docker run -it -v "$(shell pwd)"/dist:/app/dist_host portfolio-frontend-build sh -c "npm run build && rm -rf /app/dist_host/* && mv /app/dist/* /app/dist_host"

git-update:
	if [ "$(shell whoami)" != "base" ]; then sudo -u base git pull; else git pull; fi

update: git-update build-app
