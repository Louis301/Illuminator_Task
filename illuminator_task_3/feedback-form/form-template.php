<?php
// ..для предупреждения прямого доступа к странице
if (!defined('ABSPATH')) {
  exit;
}
?>

<!-- Разметка формы обратной связи -->
<div class="feedback-form-container">
  <form id="feedbackForm" novalidate>
    <?php wp_nonce_field('feedback_nonce', 'security'); ?>
    <div class="form-group">
      <label for="name">Имя *</label>
      <input type="text" id="name" name="name" required>
      <div class="error" id="nameError">Пожалуйста, введите ваше имя</div>
    </div>      
    <div class="form-group">
      <label for="email">Email *</label>
      <input type="email" id="email" name="email" required>
      <div class="error" id="emailError">Пожалуйста, введите корректный email</div>
    </div>      
    <div class="form-group">
      <label for="phone">Телефон (необязательно)</label>
      <input type="tel" id="phone" name="phone" placeholder="+7 (___) ___-__-__">
      <div class="error" id="phoneError">Пожалуйста, введите корректный номер телефона</div>
    </div>      
    <div class="form-group">
      <label for="subject">Тема обращения *</label>
      <select id="subject" name="subject" required>
        <option value="">Выберите тему</option>
        <option value="question">Вопрос</option>
        <option value="order">Заказ</option>
        <option value="error">Ошибка</option>
      </select>
      <div class="error" id="subjectError">Пожалуйста, выберите тему обращения</div>
    </div>      
    <div class="form-group">
      <label for="message">Сообщение *</label>
      <textarea id="message" name="message" rows="5" required></textarea>
      <div class="error" id="messageError">Пожалуйста, введите сообщение</div>
    </div>      
    <div class="checkbox-group">
      <input type="checkbox" id="consent" name="consent" required>
      <label for="consent">Согласен на обработку персональных данных *</label>
    </div>
    <div class="error" id="consentError">Необходимо согласие на обработку персональных данных</div>      
    <button type="submit" id="submitBtn">Отправить</button>
    <div class="message" id="formMessage"></div>
  </form>

  <!-- Подключение ACF-полей -->
  <?php if (is_page('feedback')): ?>
    <div class="contact-info" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h3 style="color: #2c3e50; margin-bottom: 15px;">Контактная информация</h3>
      <?php 
        $contact_email = get_field('contact_email');
        $contact_phone = get_field('contact_phone');
      ?>
      <?php if ($contact_email): ?>
        <p style="margin-bottom: 10px;">
          <strong>Email:</strong> 
          <a href="mailto:<?php echo esc_attr($contact_email); ?>" style="color: #3498db;">
            <?php echo esc_html($contact_email); ?>
          </a>
        </p>
      <?php endif; ?>
      <?php if ($contact_phone): ?>
        <p style="margin-bottom: 10px;">
          <strong>Телефон:</strong> 
          <span style="color: #2c3e50;"><?php echo esc_html($contact_phone); ?></span>
        </p>
      <?php endif; ?>            
      <?php if (!$contact_email && !$contact_phone): ?>
        <p style="color: #7f8c8d; font-style: italic;">
          Контактные данные не заполнены. Добавьте их в настройках страницы.
        </p>
      <?php endif; ?>
    </div>
  <?php endif; ?>
</div>