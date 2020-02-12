#!/bin/bash
set -e

echo "Running build/build.sh"
echo "Current dir:"
pwd
export DOCKER_IMAGE_AND_TAG=${1}
make lint
echo "Current dir:"
pwd
make build-prod

echo "Current dir:"
pwd
echo ">> make prune"
make prune

echo ">> make docker/build"
make docker/build

echo "DONE Running build/build.sh"