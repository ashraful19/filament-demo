<?php

return [
    'fallback_locale' => 'en',
    'locales' => ['en', 'de', 'fr'],

    'available_locales' => [
        'en' => ['label' => 'English', 'flag' => '🇬🇧'],
        'de' => ['label' => 'Deutsch', 'flag' => '🇩🇪'],
        'fr' => ['label' => 'Français', 'flag' => '🇫🇷'],
        'es' => ['label' => 'Español', 'flag' => '🇪🇸'],
        'it' => ['label' => 'Italiano', 'flag' => '🇮🇹'],
        'pt' => ['label' => 'Português', 'flag' => '🇵🇹'],
        'nl' => ['label' => 'Nederlands', 'flag' => '🇳🇱'],
        'pl' => ['label' => 'Polski', 'flag' => '🇵🇱'],
        'ru' => ['label' => 'Русский', 'flag' => '🇷🇺'],
        'ja' => ['label' => '日本語', 'flag' => '🇯🇵'],
        'zh' => ['label' => '中文', 'flag' => '🇨🇳'],
        'ko' => ['label' => '한국어', 'flag' => '🇰🇷'],
        'ar' => ['label' => 'العربية', 'flag' => '🇸🇦'],
        'tr' => ['label' => 'Türkçe', 'flag' => '🇹🇷'],
        'sv' => ['label' => 'Svenska', 'flag' => '🇸🇪'],
        'da' => ['label' => 'Dansk', 'flag' => '🇩🇰'],
        'fi' => ['label' => 'Suomi', 'flag' => '🇫🇮'],
        'nb' => ['label' => 'Norsk Bokmål', 'flag' => '🇳🇴'],
        'cs' => ['label' => 'Čeština', 'flag' => '🇨🇿'],
        'sk' => ['label' => 'Slovenčina', 'flag' => '🇸🇰'],
        'uk' => ['label' => 'Українська', 'flag' => '🇺🇦'],
        'hu' => ['label' => 'Magyar', 'flag' => '🇭🇺'],
        'ro' => ['label' => 'Română', 'flag' => '🇷🇴'],
        'bg' => ['label' => 'Български', 'flag' => '🇧🇬'],
        'el' => ['label' => 'Ελληνικά', 'flag' => '🇬🇷'],
        'id' => ['label' => 'Bahasa Indonesia', 'flag' => '🇮🇩'],
        'th' => ['label' => 'ไทย', 'flag' => '🇹🇭'],
        'vi' => ['label' => 'Tiếng Việt', 'flag' => '🇻🇳'],
        'ms' => ['label' => 'Bahasa Melayu', 'flag' => '🇲🇾'],
        'hi' => ['label' => 'हिन्दी', 'flag' => '🇮🇳'],
    ],

    'deepl' => [
        'api_key' => env('FTS_DEEPL_API_KEY'),
        'api_host' => env('FTS_DEEPL_API_HOST', 'api-free.deepl.com'),
        'formality' => 'default',
    ],
    'google_translate' => [
        'api_key' => env('FTS_GOOGLE_API_KEY'),
    ],
    'openai' => [
        'api_key' => env('FTS_OPENAI_API_KEY'),
        'model' => env('FTS_OPENAI_MODEL', 'gpt-4o-mini'),
    ],
    'anthropic' => [
        'api_key' => env('FTS_ANTHROPIC_API_KEY'),
        'model' => env('FTS_ANTHROPIC_MODEL', 'claude-haiku-4-5-20251001'),
    ],

    'scanner' => [
        'paths' => ['app', 'resources/views', 'routes'],
        'functions' => ['__', 'trans', 'trans_choice', '@lang'],
    ],

    'bulk_translation' => [
        'chunk_size' => 20,
        'queue' => 'default',
    ],

    'navigation' => [
        'group' => 'Translations',
        'sort' => 10,
    ],

    'features' => [
        'file_translation' => true,
        'content_translation' => true,
        'health_dashboard' => true,
        'webhooks' => true,
        'portal' => true,
        'auto_agent' => true,
    ],
];
