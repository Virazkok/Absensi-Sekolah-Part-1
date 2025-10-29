<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    // 'allowed_origins' => [
    //     'http://127.0.0.1:5173',
    //     'http://127.0.0.1:5173',
    //     'http://localhost:5173',
    //     'https://0a6a4c05928c.ngrok-free.app',
    // ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];

    