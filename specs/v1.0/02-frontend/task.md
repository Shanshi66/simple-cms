# Tasks

## Task 1

**Task**

- [x] Refactor shared types to @repo/types package
  - [x] 1.1 Create CMS-related shared type definitions file
  - [x] 1.2 Create validation-related shared type definitions file
  - [x] 1.3 Update @repo/types package export file
  - [x] 1.4 Update service code to use shared types
  - [x] 1.5 Add unit tests for new shared types

**Files**

- `packages/types/src/cms.ts` - Contains all CMS-related shared type definitions (Language, ArticleStatus, CreateArticleRequest, CreateArticleResponse, ArticleMetadataInput, etc.)
- `packages/types/src/validation.ts` - Contains validation-related type definitions (ValidationError, APIError) and constants (SLUG_REGEX, DATE_REGEX)
- `packages/types/src/index.ts` - Update to export all new shared types
- `packages/types/src/cms.test.ts` - Unit tests for CMS types
- `apps/service/src/types/validation.ts` - Update import statements to use shared types from @repo/types
- `apps/service/src/types/api.ts` - Update import statements to use shared types from @repo/types

## Task 2

**Task**

- [x] Initialize blog library project structure
  - [x] 2.1 Update blog library package.json configuration
  - [x] 2.2 Create TypeScript configuration file
  - [x] 2.3 Create environment variable example file
  - [x] 2.4 Create project directory structure
  - [x] 2.5 Create frontend-specific type definition file

**Files**

- `apps/blog-library/package.json` - Project configuration file with dependencies and script commands
- `apps/blog-library/tsconfig.json` - TypeScript configuration extending @repo/tsconfig base configuration
- `apps/blog-library/.env.example` - Environment variable example file with Cloudflare R2 and site API configuration
- `apps/blog-library/src/types/article.ts` - Frontend-specific type definitions (ArticleData, SiteConfig, R2Config, ParseResult)
- `apps/blog-library/content/` - Create content directory structure examples
- `apps/blog-library/scripts/` - Create scripts directory

## Task 3

**Task**

- [x] Implement MDX parser
  - [x] 3.1 Implement MDX file parsing functionality
  - [x] 3.2 Implement front matter metadata extraction
  - [x] 3.3 Implement MDX format validation
  - [x] 3.4 Implement metadata field validation
  - [x] 3.5 Add error handling and detailed error messages
  - [x] 3.6 Write comprehensive unit tests for MDX parser

**Files**

- `apps/blog-library/src/lib/mdx-parser.ts` - Main implementation of MDX parser including MDXParser class
- `apps/blog-library/src/lib/mdx-parser.test.ts` - Unit tests for MDX parser testing parsing, validation and error handling

## Task 4

**Task**

- [ ] Implement validator
  - [ ] 4.1 Implement article metadata validation functionality
  - [ ] 4.2 Implement slug format validation
  - [ ] 4.3 Implement date format validation
  - [ ] 4.4 Implement article status validation
  - [ ] 4.5 Implement unified validation error handling
  - [ ] 4.6 Write comprehensive unit tests for validator

**Files**

- `apps/blog-library/src/lib/validator.ts` - Main implementation of validator including Validator static class
- `apps/blog-library/src/lib/validator.test.ts` - Unit tests for validator testing various validation scenarios and edge cases

## Task 5

**Task**

- [ ] Implement API client
  - [ ] 5.1 Implement HTTP client basic functionality
  - [ ] 5.2 Implement authentication header handling
  - [ ] 5.3 Implement article creation API calls
  - [ ] 5.4 Implement API error handling and retry mechanism
  - [ ] 5.5 Implement response data parsing and validation
  - [ ] 5.6 Write comprehensive unit tests for API client

**Files**

- `apps/blog-library/src/lib/api-client.ts` - Main implementation of API client including APIClient class
- `apps/blog-library/src/lib/api-client.test.ts` - Unit tests for API client including success and error scenario mock tests

## Task 6

**Task**

- [ ] Implement image uploader
  - [ ] 6.1 Implement Cloudflare R2 client configuration
  - [ ] 6.2 Implement local image path scanning functionality
  - [ ] 6.3 Implement image file upload to R2 functionality
  - [ ] 6.4 Implement image path replacement in MDX content
  - [ ] 6.5 Implement upload progress and error handling
  - [ ] 6.6 Write comprehensive unit tests for image uploader

**Files**

- `apps/blog-library/src/lib/image-uploader.ts` - Main implementation of image uploader including ImageUploader class
- `apps/blog-library/src/lib/image-uploader.test.ts` - Unit tests for image uploader including file scanning, upload and path replacement tests

## Task 7

**Task**

- [ ] Implement image upload script
  - [ ] 7.1 Implement command line argument parsing
  - [ ] 7.2 Implement file path validation and reading
  - [ ] 7.3 Integrate MDX parser and image uploader
  - [ ] 7.4 Implement batch image processing workflow
  - [ ] 7.5 Implement detailed progress display and error reporting
  - [ ] 7.6 Write unit tests for image upload script

**Files**

- `apps/blog-library/scripts/imgUpload.ts` - Main implementation of image upload script including complete command line tool
- `apps/blog-library/scripts/imgUpload.test.ts` - Unit tests for image upload script testing file processing and error scenarios

## Task 8

**Task**

- [ ] Implement blog upload script
  - [ ] 8.1 Implement command line argument parsing and site identification
  - [ ] 8.2 Implement MDX file parsing and validation
  - [ ] 8.3 Implement site configuration management
  - [ ] 8.4 Integrate API client for article creation
  - [ ] 8.5 Implement comprehensive error handling and user-friendly error messages
  - [ ] 8.6 Write unit tests for blog upload script

**Files**

- `apps/blog-library/scripts/blogUpload.ts` - Main implementation of blog upload script including complete publishing workflow
- `apps/blog-library/scripts/blogUpload.test.ts` - Unit tests for blog upload script testing parsing, validation and upload workflow
