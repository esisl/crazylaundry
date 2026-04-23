<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type, X-Telegram-Init-Data');

// === КОНФИГ ===
$BOT_TOKEN = 'ВАШ_ТОКЕН_ОТ_BOTFATHER'; // ← замените
$DB_PATH = __DIR__ . '/scores.sqlite';

// === ВАЛИДАЦИЯ initData ===
function verifyInitData(string $initData, string $botToken): bool {
    $params = [];
    foreach (explode('&', $initData) as $part) {
        [$key, $value] = explode('=', $part, 2);
        $params[$key] = $value;
    }
    if (!isset($params['hash'])) return false;

    $hash = $params['hash'];
    unset($params['hash']);
    
    uksort($params, fn($a, $b) => $a <=> $b);
    $dataCheckString = implode("\n", array_map(fn($k, $v) => "$k=$v", array_keys($params), $params));
    
    $secretKey = hash_hmac('sha256', $botToken, 'WebAppData', true);
    $calculated = hash_hmac('sha256', $dataCheckString, $secretKey);
    
    return hash_equals($calculated, $hash);
}

// === БД ИНИЦИАЛИЗАЦИЯ ===
$db = new SQLite3($DB_PATH);
$db->exec('PRAGMA journal_mode=WAL;');
$db->exec('CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');

// === ОБРАБОТКА ЗАПРОСОВ ===
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $initData = $input['initData'] ?? ($_SERVER['HTTP_X_TELEGRAM_INIT_DATA'] ?? '');
    $score = (int)($input['score'] ?? 0);

    if (!verifyInitData($initData, $BOT_TOKEN)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid initData']);
        exit;
    }

    // Парсим user_id и username из initData
    $params = [];
    foreach (explode('&', $initData) as $part) {
        [$k, $v] = explode('=', $part, 2);
        $params[$k] = $v;
    }
    $user = json_decode(urldecode($params['user'] ?? '{}'), true);
    $userId = (int)($user['id'] ?? 0);
    $username = $user['username'] ?? '';

    if ($userId === 0 || $score <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing user_id or invalid score']);
        exit;
    }

    // Вставляем только если новый рекорд лучше старого
    $stmt = $db->prepare('SELECT MAX(score) as best FROM scores WHERE user_id = :uid');
    $stmt->bindValue(':uid', $userId, SQLITE3_INTEGER);
    $result = $stmt->execute()->fetchArray();
    $currentBest = (int)($result['best'] ?? 0);

    if ($score > $currentBest) {
        $stmt = $db->prepare('INSERT INTO scores (user_id, username, score) VALUES (:uid, :un, :sc)');
        $stmt->bindValue(':uid', $userId, SQLITE3_INTEGER);
        $stmt->bindValue(':un', $username, SQLITE3_TEXT);
        $stmt->bindValue(':sc', $score, SQLITE3_INTEGER);
        $stmt->execute();
    }

    echo json_encode(['status' => 'ok', 'saved' => $score > $currentBest]);
    exit;
}

// GET: таблица лидеров (топ-10)
$result = $db->query('SELECT username, score, created_at FROM scores ORDER BY score DESC LIMIT 10');
$leaderboard = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $leaderboard[] = $row;
}
echo json_encode($leaderboard);
?>