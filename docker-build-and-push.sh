#!/bin/bash
set -e

DOCKER_USER=baseangewandte
DOCKER_NAME=portfolio-frontend-build
DOCKER_REPO=${DOCKER_USER}/${DOCKER_NAME}

unset DOCKER_TAG
while ! [[ ${DOCKER_TAG}  =~ ^[0-9]+(\.[0-9]+){2}$ ]]; do
     read -p 'Enter Tag: ' DOCKER_TAG
done

docker build . -t ${DOCKER_NAME}
docker tag $(docker images -q ${DOCKER_NAME}) ${DOCKER_REPO}:${DOCKER_TAG}

docker login --username ${DOCKER_USER}
docker push ${DOCKER_REPO}:${DOCKER_TAG}
