#!/bin/bash
set -e

export DOCKER_IMAGE_AND_TAG=${1}
make lint
make build-prod
make prune
make docker/build