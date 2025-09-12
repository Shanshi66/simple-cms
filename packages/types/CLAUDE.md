# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this package.

## What this package is for

This package stores data types that are shared across multiple packages or apps. Data types that are unique to a single package or app should not be stored here.

- `src/api`: Stores data structures for communication between the frontend and backend APIs.
- `src/error`: Stores error types that are shared across multiple services.
- `src/i18n`: Stores common internationalization-related data types.

## How to export types

In each directory, such as `src/api`, the `index.ts` file needs to export all types.
