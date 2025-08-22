// src/mockData.js

export const initialFiles = [
  { id: 1, name: 'Project Alpha', is_folder: true, parent_id: null, isTrashed: false, created_at: '2025-08-15T10:00:00Z' },
  { id: 2, name: 'Marketing Assets', is_folder: true, parent_id: null, isTrashed: false, created_at: '2025-08-14T11:30:00Z' },
  { id: 3, name: 'final_report.pdf', is_folder: false, parent_id: null, isTrashed: false, created_at: '2025-08-15T14:20:00Z' },
  { id: 4, name: 'meeting-notes.docx', is_folder: false, parent_id: null, isTrashed: false, created_at: '2025-08-12T09:00:00Z' },
  { id: 5, name: 'Old Financials', is_folder: true, parent_id: null, isTrashed: true, created_at: '2025-01-20T18:00:00Z' },
  // Files inside 'Project Alpha'
  { id: 6, name: 'Design Specs', is_folder: true, parent_id: 1, isTrashed: false, created_at: '2025-08-15T10:05:00Z' },
  { id: 7, name: 'roadmap.png', is_folder: false, parent_id: 1, isTrashed: false, created_at: '2025-08-15T10:10:00Z' },
  // Files inside 'Marketing Assets'
  { id: 8, name: 'Social Media Kit', is_folder: true, parent_id: 2, isTrashed: false, created_at: '2025-08-14T11:35:00Z' },
  { id: 9, name: 'brand-logo.svg', is_folder: false, parent_id: 2, isTrashed: false, created_at: '2025-08-14T11:40:00Z' },
];