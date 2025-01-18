#!/bin/bash

# Variables
BUCKET_NAME="vitkuzawscdkpagemanagerstack-bucket83908e77-nhqm7ery8kfq"
BUILD_DIR="dist"
CLOUDFRONT_DISTRIBUTION_ID='E51NT90OQPLI4'

# Build the static site
echo "Building the application..."
npm run build

# Sync the build directory with the S3 bucket
echo "Syncing files to S3..."
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html with different cache settings
echo "Uploading index.html..."
aws s3 cp "$BUILD_DIR/index.html" "s3://$BUCKET_NAME/index.html" \
  --cache-control "public, no-cache, must-revalidate"

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment to S3 bucket $BUCKET_NAME completed successfully."
echo "CloudFront cache invalidation initiated."