# Feature: File Storage & Uploads (F001-017)

## User Context
- **Primary User:** Team member (any role) uploading files; team admin managing team assets
- **Context:** Desktop browser in authenticated SaaS app
- **Top Goals:**
  1. Upload files (avatars, attachments) with drag-drop or click
  2. See upload progress and clear error feedback on failures
  3. Manage storage within team's tier quota
- **Mental Model:** Files are team-level resources — avatars personalize identity, attachments extend content
- **Key Questions:** How much storage is left? What file types are allowed? Why did my upload fail?

## Feature Outline (Approved)

### Screens
1. **FileUploader Component** - Reusable drag-drop upload zone with progress bar and validation
2. **Profile Settings (avatar section)** - User avatar upload/change in existing profile page
3. **Team Settings (avatar section)** - Team avatar upload/change in existing general settings page
4. **Note Attachments** - File attachment support for notes (inline images, download links)

### Key User Flows
1. **Avatar Upload:** User goes to profile settings → clicks avatar → selects/drops image → sees progress → avatar updates across sidebar and profile
2. **Team Avatar Upload:** Admin goes to team settings → clicks team avatar → selects/drops image → team avatar updates in sidebar and invite pages
3. **Note Attachment:** User edits a note → drags file into attachment zone → file uploads with progress → displays inline (images) or as download link (PDFs, CSVs)
4. **Quota Exceeded:** User tries to upload → exceeds tier storage limit → sees clear error with current usage and upgrade path

### Out of Scope
- File versioning
- Folder/directory organization
- Bulk file management UI
- Image editing/cropping
- Video file support
- Public/shared file links

## User Stories
As a team member, I want to upload files with drag-drop and see progress, so that I can add avatars and attachments without friction.

As a team admin, I want to manage team avatars and monitor storage usage, so that our team's identity is polished and within plan limits.

## Acceptance Criteria
- [ ] AC1: `<FileUploader>` component renders with drag-drop zone, progress bar, and type/size validation
- [ ] AC2: Files upload directly to Convex storage via signed URL (no server relay)
- [ ] AC3: User can upload/change their profile avatar; avatar displays in sidebar and profile
- [ ] AC4: Team admin can upload/change team avatar; team avatar displays in sidebar, emails, and invite pages
- [ ] AC5: Notes support adding file attachments (images, PDFs, CSVs)
- [ ] AC6: File attachments display inline or as download links depending on type
- [ ] AC7: Storage quota is enforced per tier (via `checkEntitlement` with `storageQuotaMB`)
- [ ] AC8: Upload rejected with clear error when file type is not in allowlist
- [ ] AC9: Upload rejected with clear error when file exceeds size limit
- [ ] AC10: Files can be deleted (removes from Convex storage and entity reference)

## Edge Cases
- **Zero storage left:** Upload button disabled, message shows "Storage quota reached" with upgrade link
- **Large file (near limit):** If individual file + existing usage exceeds quota, reject with remaining capacity shown
- **Unsupported file type:** Immediate client-side rejection with list of accepted types
- **Network interruption during upload:** Progress bar shows error state, retry button available
- **Avatar replacement:** Old avatar storage is deleted when new one is uploaded
- **Concurrent uploads:** Multiple files can upload in parallel with independent progress bars
- **Empty file:** Reject zero-byte files with clear message

## Success Definition
We'll know this works when: Users can upload avatars and file attachments through a polished drag-drop interface, storage quotas are enforced per tier, and files persist in Convex storage with proper cleanup on deletion.
