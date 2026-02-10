<?php
header('Content-Type: application/json; charset=utf-8');

// Защита от прямого доступа
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен']);
    exit;
}

// Проверка CSRF токена
session_start();
if (!isset($_POST['csrf_token']) || empty($_POST['csrf_token'])) {
    echo json_encode(['success' => false, 'message' => 'Недопустимый запрос']);
    exit;
}

// Функция для безопасного экранирования данных
function sanitizeInput($data) {
	$data = trim($data);
	$data = stripslashes($data);
	$data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
	return $data;
}

// Получение и очистка данных
$name    = isset($_POST['name']) ? sanitizeInput($_POST['name']) : '';
$email   = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
$phone   = isset($_POST['phone']) ? sanitizeInput($_POST['phone']) : '';
$subject = isset($_POST['subject']) ? sanitizeInput($_POST['subject']) : '';
$message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';
$consent = isset($_POST['consent']) ? true : false;

// Валидация на сервере
$errors = [];

// Имя
if (empty($name)) {
	$errors[] = 'Имя обязательно для заполнения';
} elseif (strlen($name) < 2 || strlen($name) > 50) {
	$errors[] = 'Имя должно содержать от 2 до 50 символов';
}

// Email
if (empty($email)) {
	$errors[] = 'Email обязателен для заполнения';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	$errors[] = 'Некорректный формат email';
}

// Телефон (если указан)
if (!empty($phone)) {
	// Удаляем все нецифровые символы
	$cleanPhone = preg_replace('/\D/', '', $phone);
	
	// Проверяем формат: должно быть 11 цифр, начинающихся с 7 или 8
	if (strlen($cleanPhone) !== 11 || !preg_match('/^[78]/', $cleanPhone)) {
			$errors[] = 'Некорректный формат телефона';
	}
	
	// Нормализуем телефон: заменяем первую цифру на 7, если она 8
	if (substr($cleanPhone, 0, 1) === '8') {
			$cleanPhone = '7' . substr($cleanPhone, 1);
	}
	
	// Форматируем телефон для сохранения
	$formattedPhone = '+' . substr($cleanPhone, 0, 1) . ' (' . 
												substr($cleanPhone, 1, 3) . ') ' . 
												substr($cleanPhone, 4, 3) . '-' . 
												substr($cleanPhone, 7, 2) . '-' . 
												substr($cleanPhone, 9, 2);
} else {
	$formattedPhone = '';
}

// Тема обращения
$validSubjects = ['question', 'order', 'error'];
$subjectLabels = [
	'question' => 'Вопрос',
	'order' => 'Заказ',
	'error' => 'Ошибка'
];

if (empty($subject) || !in_array($subject, $validSubjects)) {
	$errors[] = 'Выберите корректную тему обращения';
}

// Сообщение
if (empty($message)) {
	$errors[] = 'Сообщение обязательно для заполнения';
} elseif (strlen($message) < 1 || strlen($message) > 1000) {
	$errors[] = 'Сообщение должно содержать от 1 до 1000 символов';
}

// Согласие на обработку данных
if (!$consent) {
	$errors[] = 'Необходимо согласие на обработку персональных данных';
}

// Если есть ошибки валидации
if (!empty($errors)) {
	echo json_encode([
		'success' => false,
		'message' => implode(', ', $errors)
	]);
	exit;
}

// Подготовка данных для сохранения
$subjectLabel = $subjectLabels[$subject];
$date = date('d.m.Y H:i:s');
$phoneDisplay = $formattedPhone ? "телефон: {$formattedPhone}, " : '';

// Формат записи
$entry = "{$name} <{$email}>, {$phoneDisplay}тема: {$subjectLabel}, дата: {$date}" . PHP_EOL;

// Сохранение в файл
$filePath = 'feedback.txt';

// Создаем директорию, если не существует
if (!file_exists(dirname($filePath))) {
	mkdir(dirname($filePath), 0755, true);
}

// Блокировка файла для предотвращения конфликтов
$file = fopen($filePath, 'a');
if ($file) {
	if (flock($file, LOCK_EX)) {
		fwrite($file, $entry);
		fflush($file);
		flock($file, LOCK_UN);
		fclose($file);
		
		echo json_encode([
			'success' => true,
			'message' => 'Ваше сообщение успешно отправлено!'
		]);
	} else {
		fclose($file);
		echo json_encode([
			'success' => false,
			'message' => 'Не удалось заблокировать файл для записи'
		]);
	}
} else {
	echo json_encode([
		'success' => false,
		'message' => 'Не удалось открыть файл для записи'
  ]);
}
?>