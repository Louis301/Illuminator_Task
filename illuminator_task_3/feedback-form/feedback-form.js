// Маска для телефона
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length === 0) {
                e.target.value = '';
                return;
            }
            
            if (value[0] !== '7' && value[0] !== '8') {
                value = '7' + value;
            }
            
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            
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
    }

    // Валидация email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Показ ошибки
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (field && errorElement) {
            field.classList.add('has-error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Скрытие ошибки
    function hideError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (field && errorElement) {
            field.classList.remove('has-error');
            errorElement.style.display = 'none';
        }
    }

    // Валидация формы
    function validateForm() {
        let isValid = true;
        
        const name = document.getElementById('name').value.trim();
        if (!name) {
            showError('name', 'Пожалуйста, введите ваше имя');
            isValid = false;
        } else {
            hideError('name');
        }
        
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
        
        const phone = document.getElementById('phone').value.trim();
        if (phone) {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length !== 11 || !cleaned.startsWith('7')) {
                showError('phone', 'Пожалуйста, введите корректный номер телефона');
                isValid = false;
            } else {
                hideError('phone');
            }
        } else {
            hideError('phone');
        }
        
        const subject = document.getElementById('subject').value;
        if (!subject) {
            showError('subject', 'Пожалуйста, выберите тему обращения');
            isValid = false;
        } else {
            hideError('subject');
        }
        
        const message = document.getElementById('message').value.trim();
        if (!message) {
            showError('message', 'Пожалуйста, введите сообщение');
            isValid = false;
        } else {
            hideError('message');
        }
        
        const consent = document.getElementById('consent').checked;
        if (!consent) {
            showError('consent', 'Необходимо согласие на обработку персональных данных');
            isValid = false;
        } else {
            hideError('consent');
        }
        
        return isValid;
    }

    // Обработка отправки
    const form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }
            
            const submitBtn = document.getElementById('submitBtn');
            const formMessage = document.getElementById('formMessage');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
            
            try {
                const formData = new FormData(this);
                formData.append('action', 'submit_feedback');
                
                // для вордпресса
                const response = await fetch(feedback_ajax.ajax_url, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    formMessage.className = 'message success';
                    formMessage.textContent = result.data.message;
                    formMessage.style.display = 'block';
                    
                    this.reset();
                } else {
                    formMessage.className = 'message error';
                    formMessage.textContent = result.data.message || 'Произошла ошибка';
                    formMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Ошибка:', error);
                formMessage.className = 'message error';
                formMessage.textContent = 'Произошла ошибка при отправке';
                formMessage.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Отправить';
            }
        });
    }

    // Скрытие ошибок при вводе
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', function() {
            hideError(this.id);
        });
    });

    const consentCheckbox = document.getElementById('consent');
    if (consentCheckbox) {
        consentCheckbox.addEventListener('change', function() {
            hideError('consent');
        });
    }
});