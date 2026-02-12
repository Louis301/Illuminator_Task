<?php
//-------------------------------------------------- проверка активности темы
if (!defined('ABSPATH')) {
  exit;
}

//-------------------------------------------------- подключение стилей и скриптов
add_action('wp_enqueue_scripts', 'feedback_form_assets');
function feedback_form_assets() {
  // проверка наличия страницы "обратная связь"
  if (!(is_page('feedback') || is_page('обратная-связь')))
    return;      
  $theme_dir = get_template_directory_uri();
      
  // css
  $css_file = $theme_dir . '/feedback-form/feedback-form.css';
  wp_enqueue_style('feedback-style', $css_file, [], '1.0.0');
  // js
  $js_file = $theme_dir . '/feedback-form/feedback-form.js';
  wp_enqueue_script('feedback-script', $js_file, [], '1.0.0', true);
  
  // передача данных js
  wp_localize_script('feedback-script', 'feedback_ajax', [
    'ajax_url' => admin_url('admin-ajax.php'),
    'nonce'    => wp_create_nonce('feedback_nonce'),
    'is_debug' => WP_DEBUG
  ]);
}

//-------------------------------------------------- обработка шорткода feedback_form
add_shortcode('feedback_form', 'render_feedback_form');
function render_feedback_form() {
  $template = get_template_directory() . '/feedback-form/form-template.php'; 

  if (file_exists($template)) {
    ob_start();
    include $template;
    return ob_get_clean();
  } else {
    return '<p style="color: red;">Ошибка: файл form-template.php не найден!</p>';
  }
}

//-------------------------------------------------- регистрация типа записи 
add_action('init', 'register_form_result_cpt');
function register_form_result_cpt() {
  register_post_type('form_result',
    [
      'labels' => [
        'name'               => 'Результаты форм',
        'singular_name'      => 'Результат формы',
        'add_new'            => 'Добавить результат',
        'add_new_item'       => 'Добавить новый результат',
        'edit_item'          => 'Редактировать результат',
        'new_item'           => 'Новый результат',
        'view_item'          => 'Просмотр результата',
        'search_items'       => 'Поиск результатов',
        'not_found'          => 'Результаты не найдены',
        'not_found_in_trash' => 'В корзине нет результатов',
      ],
      'public'        => true,
      'has_archive'   => false,
      'show_in_menu'  => true,
      'menu_icon'     => 'dashicons-feedback',
      'menu_position' => 25,
      'supports'      => ['title', 'editor'],
      'rewrite'       => ['slug' => 'form-result'],
    ]
  );
}

//-------------------------------------------------- AJAX-обработчик формы
add_action('wp_ajax_submit_feedback', 'handle_feedback_submission');
add_action('wp_ajax_nopriv_submit_feedback', 'handle_feedback_submission');

function handle_feedback_submission() {
  // -- Проверка nonce --
  if (!isset($_POST['security']) || !wp_verify_nonce($_POST['security'], 'feedback_nonce')) {
    wp_send_json_error(['message' => 'Ошибка безопасности. Обновите страницу.']);
  }

  // -- Локализация и нормализация данных формы --
  $name    = sanitize_text_field($_POST['name']);
  $email   = sanitize_email($_POST['email']);
  $phone   = sanitize_text_field($_POST['phone']);
  $subject = sanitize_text_field($_POST['subject']);
  $message = sanitize_textarea_field($_POST['message']);
  $consent = isset($_POST['consent']);

  // -- Валидация данных формы --
  $errors = [];
  
  if (empty($name)) {
    $errors[] = 'Имя обязательно';
  } elseif (strlen($name) < 2 || strlen($name) > 50) {
    $errors[] = 'Имя должно содержать от 2 до 50 символов';
  }
  
  if (empty($email)) {
    $errors[] = 'Email обязателен';
  } elseif (!is_email($email)) {
    $errors[] = 'Некорректный email';
  }
  
  if (!empty($phone)) {
    $cleanPhone = preg_replace('/\D/', '', $phone);
    if (strlen($cleanPhone) !== 11 || !preg_match('/^[78]/', $cleanPhone)) {
      $errors[] = 'Некорректный формат телефона';
    }
  }
  
  $validSubjects = ['question', 'order', 'error'];
  if (empty($subject) || !in_array($subject, $validSubjects)) {
    $errors[] = 'Выберите корректную тему';
  }
  
  if (empty($message)) {
    $errors[] = 'Введите сообщение';
  } elseif (strlen($message) > 1000) {
    $errors[] = 'Сообщение не должно превышать 1000 символов';
  }
  
  if (!$consent) {
    $errors[] = 'Необходимо согласие на обработку данных';
  }
    
  // -- Отправка ошибок валидации на клиент --
  if (!empty($errors)) {
    wp_send_json_error(['message' => implode(', ', $errors)]);
  }

  // -- Маппинг тем --
  $subjectLabels = [
    'question' => 'Вопрос',
    'order'    => 'Заказ',
    'error'    => 'Ошибка'
  ];
  $subjectLabel = isset($subjectLabels[$subject]) ? $subjectLabels[$subject] : $subject;

  // -- Создание записи для рубрики --
  $post_data = [
    'post_title'   => 'Обращение от ' . $name . ' (' . date('d.m.Y H:i') . ')',
    'post_content' => $message,
    'post_type'    => 'form_result',
    'post_status'  => 'publish',
    'meta_input'   => [
      'feedback_name'    => $name,
      'feedback_email'   => $email,
      'feedback_phone'   => $phone,
      'feedback_subject' => $subjectLabel,
    ],
  ];
  $post_id = wp_insert_post($post_data);

  // -- Добавление записи --
  if ($post_id) {
    $term = term_exists('Форма обратной связи', 'form_category');
    if (!$term) {
      $term = wp_insert_term('Форма обратной связи', 'form_category');
    }
    if (!is_wp_error($term)) {
      wp_set_object_terms($post_id, $term, 'form_category');
    }    
    wp_send_json_success(['message' => 'Ваше сообщение успешно отправлено!']);
  } else {
    wp_send_json_error(['message' => 'Ошибка сохранения данных']);
  }
}

//-------------------------------------------------- настройка таксономии
add_action('init', 'register_form_result_category');
function register_form_result_category() {
  register_taxonomy(
    'form_category',
    'form_result',
    [
      'labels' => [
        'name'              => 'Рубрики',
        'singular_name'     => 'Рубрика',
        'search_items'      => 'Искать рубрики',
        'all_items'         => 'Все рубрики',
        'parent_item'       => 'Родительская рубрика',
        'parent_item_colon' => 'Родительская рубрика:',
        'edit_item'         => 'Редактировать рубрику',
        'update_item'       => 'Обновить рубрику',
        'add_new_item'      => 'Добавить новую рубрику',
        'new_item_name'     => 'Название новой рубрики',
        'menu_name'         => 'Рубрики результатов',
      ],
      'hierarchical'      => true,
      'show_ui'           => true,
      'show_admin_column' => true,
      'query_var'         => true,
      'rewrite'           => ['slug' => 'form-category'],
    ]
  );
}

//-------------------------------------------------- колонки списка записей
add_filter('manage_form_result_posts_columns', 'add_feedback_columns');
function add_feedback_columns($columns) {
  $columns['feedback_name']    = 'Имя';
  $columns['feedback_email']   = 'Email';
  $columns['feedback_phone']   = 'Телефон';
  $columns['feedback_subject'] = 'Тема';
  return $columns;
}

//--------------------------------------------------
add_action('manage_form_result_posts_custom_column', 'display_feedback_columns', 10, 2);
function display_feedback_columns($column, $post_id) {
  echo esc_html(get_post_meta($post_id, $column, true));
}