<?php
// /home/deploy/crazylaundry/api/scores.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type, X-Telegram-Init-Data');

// === КОНФИГ ===
$BOT_TOKEN = file_get_contents(__DIR__ . '/../token');
$DB_PATH = __DIR__ . '/scores.sqlite';
$DEBUG_LOG = __DIR__ . '/debug.log';

// === ФУНКЦИЯ ЛОГИРОВАНИЯ ===
function debugLog($message, $data = null) {
    global $DEBUG_LOG;
    $time = date('Y-m-d H:i:s');
    $entry = "[$time] $message\n";
    if ($data !== null) {
        $entry .= print_r($data, true) . "\n";
    }
    $entry .= str_repeat('-', 80) . "\n";
    @file_put_contents($DEBUG_LOG, $entry, FILE_APPEND | LOCK_EX);
}

// === ВАЛИДАЦИЯ initData (ТОЧНАЯ КОПИЯ СПЕЦИФИКАЦИИ) ===
function verifyInitData(string $initData, string $botToken): bool {
    // Парсинг строки в массив (БЕЗ urldecode!)
    $params = [];
    foreach (explode('&', $initData) as $part) {
        if (strpos($part, '=') === false) continue;
        [$key, $value] = explode('=', $part, 2);
        $params[$key] = $value;
    }
    
    // Должен быть hash
    if (!isset($params['hash'])) {
        debugLog('❌ Нет hash в параметрах');
        return false;
    }
    $hash = $params['hash'];
    
    // Исключаем служебные поля из валидации
    unset($params['hash'], $params['signature']);
    
    debugLog('Параметры для хэша (после unset)', array_keys($params));
    
    // Сортировка ключей по алфавиту
    uksort($params, fn($a, $b) => $a <=> $b);
    
    // Формирование data_check_string (разделитель - байт 0x0A)
    $dataCheckString = implode("\n", array_map(
        fn($k, $v) => "$k=$v", 
        array_keys($params), 
        $params
    ));
    
    debugLog('data_check_string', $dataCheckString);
    debugLog('data_check_string (hex snippet)', bin2hex(substr($dataCheckString, 0, 200)));
    
    // Вычисление секретного ключа: HMAC-SHA256("WebAppData", botToken)
    // КРИТИЧНО: порядок аргументов в PHP hash_hmac: data, key
    $secretKey = hash_hmac('sha256', 'WebAppData', $botToken, true);
    
    // Вычисление финального хэша (возвращает hex-строку)
    $calculated = hash_hmac('sha256', $dataCheckString, $secretKey);
    
    debugLog('Хеши', [
        'received' => $hash,
        'calculated' => $calculated,
        'match' => hash_equals($calculated, $hash),
        'received_len' => strlen($hash),
        'calculated_len' => strlen($calculated)
    ]);
    
    // Безопасное сравнение
    return hash_equals($calculated, $hash);
}

// === ИНИЦИАЛИЗАЦИЯ БД ===
try {
    $db = new SQLite3($DB_PATH);
    $db->exec('PRAGMA journal_mode=WAL;');
    $db->exec('CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        username TEXT,
        score INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, score)
    )');
} catch (Exception $e) {
    debugLog('❌ Ошибка БД', ['message' => $e->getMessage()]);
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit;
}

// === ОБРАБОТКА ЗАПРОСОВ ===
debugLog('=== НОВЫЙ ЗАПРОС ===', [
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'raw_input' => substr(file_get_contents('php://input'), 0, 500)
]);

// Читаем score из JSON-тела
$input = json_decode(file_get_contents('php://input'), true);
$score = (int)($input['score'] ?? 0);

// Читаем initData ИЗ ЗАГОЛОВКА (сырая строка!)
$initData = $_SERVER['HTTP_X_TELEGRAM_INIT_DATA'] ?? '';

debugLog('Входные данные', [
    'score' => $score,
    'initData_present' => !empty($initData),
    'initData_length' => strlen($initData),
    'initData_preview' => substr($initData, 0, 100)
]);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Валидация
    if (!$initData || !verifyInitData($initData, $BOT_TOKEN)) {
        debugLog('❌ Валидация НЕ ПРОШЛА', ['initData_preview' => substr($initData ?? '', 0, 50)]);
        http_response_code(401);
        echo json_encode(['error' => 'Invalid initData']);
        exit;
    }
    
    debugLog('✅ Валидация прошла успешно');
    
    // Парсим данные пользователя (после успешной валидации можно декодировать)
    $userRaw = $initData;
    parse_str($userRaw, $parsed); // Парсим как query string для удобства
    $userJson = urldecode($parsed['user'] ?? '{}');
    $userData = json_decode($userJson, true);
    
    $userId = (int)($userData['id'] ?? 0);
    $username = $userData['username'] ?? '';
    
    debugLog('Данные пользователя', ['user_id' => $userId, 'username' => $username]);
    
    if ($userId === 0 || $score <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        exit;
    }
    
    // Вставляем только если новый рекорд лучше старого
    $stmt = $db->prepare('SELECT MAX(score) as best FROM scores WHERE user_id = :uid');
    $stmt->bindValue(':uid', $userId, SQLITE3_INTEGER);
    $result = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
    $currentBest = (int)($result['best'] ?? 0);
    
    $saved = false;
    if ($score > $currentBest) {
        $stmt = $db->prepare('INSERT OR REPLACE INTO scores (user_id, username, score) VALUES (:uid, :un, :sc)');
        $stmt->bindValue(':uid', $userId, SQLITE3_INTEGER);
        $stmt->bindValue(':un', $username, SQLITE3_TEXT);
        $stmt->bindValue(':sc', $score, SQLITE3_INTEGER);
        $stmt->execute();
        $saved = true;
        debugLog('💾 Рекорд сохранён', ['user_id' => $userId, 'score' => $score]);
    } else {
        debugLog('⏭ Рекорд не лучше текущего', ['current' => $currentBest, 'new' => $score]);
    }
    
    echo json_encode(['status' => 'ok', 'saved' => $saved, 'best' => max($currentBest, $score)]);
    exit;
}

// GET: таблица лидеров (топ-10)
$result = $db->query('SELECT username, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 10');
$leaderboard = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $leaderboard[] = $row;
}
echo json_encode($leaderboard);
?>