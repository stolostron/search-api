#!/bin/bash
# Copyright (c) 2021 Red Hat, Inc.
# Copyright Contributors to the Open Cluster Management project
set -e

echo "> Running build/run-e2e-tests.sh"
export DOCKER_IMAGE_AND_TAG=${1}
# make docker/run