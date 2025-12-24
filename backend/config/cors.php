<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173', 'vision.jammaderas.com', 'https://vision.jammaderas.com'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
];
