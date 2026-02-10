
// -------------------------------------------------- // Генерация CSRF токена
function generateCSRFToken() {
    return btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
}

// Установка CSRF токена
document.getElementById('csrfToken').value = generateCSRFToken();

// Маска для телефона
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length === 0) {
        e.target.value = '';
        return;
    }
    
    // Добавляем +7 в начало
    if (value[0] !== '7') {
        value = '7' + value;
    }
    
    // Ограничиваем длину до 11 цифр
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    // Форматируем номер
    let formatted = '+7';
    if (value.length > 1) {
        formatted += ' (' + value.substring(1, 4);
    }
    if (value.length >= 4) {
        formatted += ') ' + value.substring(4, 7);
    }
    if (value.length >= 7) {
        formatted += '-' + value.substring(7, 9);
    }
    if (value.length >= 9) {
        formatted += '-' + value.substring(9, 11);
    }
    
    e.target.value = formatted;
});

// -------------------------------------------------- // Валидация email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// -------------------------------------------------- // Валидация телефона
function validatePhone(phone) {
    if (!phone) return true; // Необязательное поле
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11 && cleaned.startsWith('7');
}

// -------------------------------------------------- // Отображение ошибки
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    field.classList.add('has-error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// -------------------------------------------------- // Скрытие ошибки
function hideError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    field.classList.remove('has-error');
    errorElement.style.display = 'none';
}

// -------------------------------------------------- // Валидация формы
function validateForm() {
    let isValid = true;
    
    // Имя
    const name = document.getElementById('name').value.trim();
    if (!name) {
        showError('name', 'Пожалуйста, введите ваше имя');
        isValid = false;
    } else {
        hideError('name');
    }
    
    // Email
    const email = document.getElementById('email').value.trim();
    if (!email) {
        showError('email', 'Пожалуйста, введите ваш email');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('email', 'Пожалуйста, введите корректный email');
        isValid = false;
    } else {
        hideError('email');
    }
    
    // Телефон
    const phone = document.getElementById('phone').value.trim();
    if (phone && !validatePhone(phone)) {
        showError('phone', 'Пожалуйста, введите корректный номер телефона');
        isValid = false;
    } else {
        hideError('phone');
    }
    
    // Тема обращения
    const subject = document.getElementById('subject').value;
    if (!subject) {
        showError('subject', 'Пожалуйста, выберите тему обращения');
        isValid = false;
    } else {
        hideError('subject');
    }
    
    // Сообщение
    const message = document.getElementById('message').value.trim();
    if (!message) {
        showError('message', 'Пожалуйста, введите сообщение');
        isValid = false;
    } else {
        hideError('message');
    }
    
    // Согласие
    const consent = document.getElementById('consent').checked;
    if (!consent) {
        showError('consent', 'Необходимо согласие на обработку персональных данных');
        isValid = false;
    } else {
        hideError('consent');
    }
    
    return isValid;
}

// Обработка отправки формы
document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Валидация на клиенте
    if (!validateForm()) {
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    
    // Блокируем кнопку
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    
    try {
        const formData = new FormData(this);
        
        const response = await fetch('submit.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            formMessage.className = 'message success';
            formMessage.textContent = result.message;
            formMessage.style.display = 'block';
            
            // Сброс формы
            this.reset();
            // Обновление CSRF токена
            document.getElementById('csrfToken').value = generateCSRFToken();
        } else {
            formMessage.className = 'message error';
            formMessage.textContent = result.message || 'Произошла ошибка при отправке формы';
            formMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка:', error);
        formMessage.className = 'message error';
        formMessage.textContent = 'Произошла ошибка при отправке формы. Попробуйте позже.';
        formMessage.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить';
    }
});

// Скрытие ошибок при вводе
document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
        hideError(field.id);
    });
});

// Скрытие ошибки чекбокса при изменении
document.getElementById('consent').addEventListener('change', () => {
    hideError('consent');
});