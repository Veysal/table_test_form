document.addEventListener('DOMContentLoaded', function() {
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
            });

            // Блокировка горячих клавиш
            document.addEventListener('keydown', function(e) {
                // Блокировка
                if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyC' || e.code === 'KeyV' || e.code === 'KeyX')) {
                    const target = e.target;
                    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
                        e.preventDefault();
                        return false;
                    }
                }

                // Блокировка F12, Ctrl+Shift+I, Ctrl+Shift+J (DevTools)
                if (e.code === 'F12' ||
                    (e.ctrlKey && e.shiftKey && (e.code === 'KeyI' || e.code === 'KeyJ' || e.code === 'KeyC'))) {
                    e.preventDefault();
                    return false;
                }
            });

            // Блокировка вставки в поля ввода
            const inputs = document.querySelectorAll('input[type="text"], textarea');
            inputs.forEach(input => {
                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    alert('Вставка текста запрещена! Пожалуйста, напишите ответ вручную.');
                    return false;
                });

                input.addEventListener('drop', function(e) {
                    e.preventDefault();
                    return false;
                });
            });

            // Таймер
            let timeLeft = 25 * 60; // Минуты в секунды
            const timerElement = document.getElementById('timer');
            
            const timerInterval = setInterval(function() {
                timeLeft--;
                
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                
                timerElement.textContent = `Время: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                if (timeLeft <= 300) { 
                    timerElement.style.background = 'rgba(255, 0, 0, 0.3)';
                }
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    alert('⏰ Время вышло! Тест будет автоматически отправлен.');
                    document.getElementById('testForm').dispatchEvent(new Event('submit'));
                }
            }, 1000);

            // Отправка формы
            const form = document.getElementById('testForm');
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = document.getElementById('submitBtn');
                const studentName = document.getElementById('studentName').value.trim();
                const studentEmail = document.getElementById('studentEmail').value.trim();
                const studentGroup = document.getElementById('studentGroup').value.trim();
                
                if (!studentName || !studentEmail || !studentGroup) {
                    alert('Пожалуйста, заполните информацию о себе!');
                    return;
                }
                
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';
                
                // Сбор данных
                const formData = new FormData(form);
                const answers = {
                    timestamp: new Date().toLocaleString('ru-RU'),
                    name: studentName,
                    email: studentEmail,
                    group: studentGroup
                };
                
                for (let i = 1; i <= 25; i++) {
                    answers[`q${i}`] = formData.get(`q${i}`) || '';
                }
                
                // Ссылка из Google Apps Script
                const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzm5dt6TDWtUTSaho-ubSkEwbXHAXlH4HZbIGJB_sFk-fVCJyT0NamJzQUFRtHt1Jx-/exec';
                
                try {
                    const response = await fetch(SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(answers)
                    });
                    
                    // Показать сообщение об успехе
                    document.getElementById('successMessage').style.display = 'block';
                    form.style.display = 'none';
                    document.querySelector('.student-info').style.display = 'none';
                    document.querySelector('.warning').style.display = 'none';
                    clearInterval(timerInterval);
                    
                } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Произошла ошибка при отправке. Пожалуйста, свяжитесь с преподавателем.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Отправить тест';
                }
            });

            // Предупреждение при закрытии страницы
            window.addEventListener('beforeunload', function(e) {
                if (!document.getElementById('successMessage').style.display || 
                    document.getElementById('successMessage').style.display === 'none') {
                    e.preventDefault();
                    e.returnValue = '';
                    return '';
                }
            });
        });