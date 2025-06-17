export const SDK_LANGUAGE_SPECS = [
  { key: 'js', file: 'supabase_js_v2.yml' },
  { key: 'py', file: 'supabase_py_v2.yml' },
  { key: 'dart', file: 'supabase_dart_v2.yml' },
  { key: 'swift', file: 'supabase_swift_v2.yml' },
  { key: 'kotlin', file: 'supabase_kt_v3.yml' },
  { key: 'csharp', file: 'supabase_csharp_v1.yml' }
] as const

export type SDKLanguageKey = typeof SDK_LANGUAGE_SPECS[number]['key']

export const COMMON_CLIENT_LIBS_SECTIONS_FILE = 'common-client-libs-sections.json'