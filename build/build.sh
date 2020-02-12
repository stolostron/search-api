#!/bin/bash
set -e

echo "Running build/build.sh"

export DOCKER_IMAGE_AND_TAG=${1}
make lint
make build-prod

echo ">> make prune"
make prune

echo ">> make docker/build"
make docker/build

echo "DONE Running build/build.sh"