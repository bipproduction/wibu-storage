#!/bin/bash

PROJECT_PATH="/root/projects/staging/darmasaba/"
RELEASE_NAME="stg-002"
RELEASE_PATH="$PROJECT_PATH/releases"
ENV_PATH="$PROJECT_PATH/shared/env"
SCRIPT_PATH="$PROJECT_PATH/scripts"
ENV_NAME="staging"

# BUILD RELEASE
if [ -f $ENV_PATH/.env.$ENV_NAME ]; then
    export $(grep -v '^#' $ENV_PATH/.env.$ENV_NAME | xargs)
else
    echo "Environment file $ENV_PATH/.env.$ENV_NAME not found!"
    exit 1
fi

cd $RELEASE_PATH/$RELEASE_NAME || { echo "Directory $RELEASE_PATH/$RELEASE_NAME not found!"; exit 1; }

# INSTALL DEPENDENCIES
bun i || { echo "Install dependencies failed!"; exit 1; }

# BUILD RELEASE
nice -n 19 bun run build || { echo "Build failed!"; exit 1; }

# PUSH PRISMA
nice -n 19 bunx prisma db push || { echo "Prisma DB push failed!"; exit 1; }

# PROMOTE RELEASE

# Mendefinisikan path sumber dan tujuan
SOURCE_DIR=$RELEASE_PATH/$RELEASE_NAME
TARGET_DIR=$PROJECT_PATH/current

# Menghapus symlink jika sudah ada
if [ -L "$TARGET_DIR" ]; then
    echo "Menghapus symlink yang sudah ada di $TARGET_DIR"
    rm "$TARGET_DIR" || { echo "Failed to remove existing symlink!"; exit 1; }
fi

# Membuat symlink baru
ln -s "$SOURCE_DIR" "$TARGET_DIR" || { echo "Failed to create symlink!"; exit 1; }

# Memeriksa apakah symlink berhasil dibuat
if [ -L "$TARGET_DIR" ]; then
    echo "Symlink berhasil dibuat dari $SOURCE_DIR ke $TARGET_DIR"
else
    echo "Gagal membuat symlink"
    exit 1
fi

# RESTART SERVER
pm2 restart namespace:darmasaba-staging || { echo "Failed to restart darmasaba-staging namespace!"; exit 1; }

echo "Build process completed successfully!"
