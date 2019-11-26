#!/bin/bash
set -o nounset
set -o errexit
set -o pipefail

function execute_and_echo {
    echo "$@"
    "$@"
}

function usage() {
  echo "Usage pullimage.sh --image-name=<image name>"
  exit 1
}

if [ -z "${SUITESPOT_REGISTRY+x}" ]; then echo "SUITESPOT_REGISTRY variable must be set"; exit 1; fi
if [ -z "${SUITESPOT_IMAGE_TAG+x}" ]; then echo "SUITESPOT_IMAGE_TAG variable must be set"; exit 1; fi

for i in "$@"
do
case $i in
    -i=*|--image-name=*)
    IMAGE_NAME="${i#*=}"
    shift # past argument=value
    ;;
    -pi=*|--push-image-name=*)
    PUSH_IMAGE_NAME="${i#*=}"
    shift # past argument=value
    ;;
    --default)
    DEFAULT=YES
    shift # past argument with no value
    ;;
    *)
            # unknown option
    ;;
esac
done

if [ -z "${IMAGE_NAME+x}" ]; then usage; fi
if [ -z "${PUSH_IMAGE_NAME+x}" ]; then PUSH_IMAGE_NAME=IMAGE_NAME; fi

BUILD_DIR=$(pwd)

echo "Running in ${BUILD_DIR}"
echo "REGISTRY   = ${SUITESPOT_REGISTRY}"
echo "IMAGE_TAG  = ${SUITESPOT_IMAGE_TAG}"
echo "IMAGE_NAME = ${IMAGE_NAME}"
echo "PUSH_IMAGE_NAME = ${PUSH_IMAGE_NAME}"

execute_and_echo docker pull ${SUITESPOT_REGISTRY}/${PUSH_IMAGE_NAME}:${SUITESPOT_IMAGE_TAG}
execute_and_echo docker tag ${SUITESPOT_REGISTRY}/${PUSH_IMAGE_NAME}:${SUITESPOT_IMAGE_TAG} ${IMAGE_NAME}:latest 
