document.addEventListener('DOMContentLoaded', function() {
    const TEST_DURATION_MINUTES = 25;
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylAL_RTbOYDtdiOpuYcM2PTZgTbWMgglbBT_-OmywbaA6qrfeETH-aabO20V6CJrPx/exec';
    const NUM_QUESTIONS = 25;

    // --- Элементы DOM ---
    const form = document.getElementById('testForm');
    const timerElement = document.getElementById('timer');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    const startTime = new Date();
    let timerInterval;

    const disableEvent = (e) => {
        e.preventDefault();
        return false;
    };

    const showAlertAndPrevent = (e) => {
        e.preventDefault();
        alert('Вставка текста запрещена! Пожалуйста, напишите ответ вручную.');
        return false;
    };

    document.addEventListener('contextmenu', disableEvent);

    document.addEventListener('keydown', (e) => {
        const isDevToolsKey = e.code === 'F12' || (e.ctrlKey && e.shiftKey && ['KeyI', 'KeyJ', 'KeyC'].includes(e.code));
        const isCopyPasteKey = (e.ctrlKey || e.metaKey) && ['KeyC', 'KeyV', 'KeyX'].includes(e.code);

        if (isDevToolsKey) {
            return disableEvent(e);
        }

        if (isCopyPasteKey && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) {
            return disableEvent(e);
        }
    });

    form.addEventListener('paste', showAlertAndPrevent);
    form.addEventListener('drop', disableEvent);

    let timeLeft = TEST_DURATION_MINUTES * 60;

    timerInterval = setInterval(() => {
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
            form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
    }, 1000);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentName = document.getElementById('studentName').value.trim();
        const studentEmail = document.getElementById('studentEmail').value.trim();
        const studentGroup = document.getElementById('studentGroup').value.trim();

        if (!studentName || !studentEmail || !studentGroup) {
            alert('Пожалуйста, заполните информацию о себе!');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        const formData = new FormData(form);
        const answers = {
            startTime: startTime.toISOString(), // Отправляем время начала в формате ISO
            name: studentName,
            email: studentEmail,
            group: studentGroup
        };

        for (let i = 1; i <= NUM_QUESTIONS; i++) {
            answers[`q${i}`] = formData.get(`q${i}`) || '';
        }

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(answers)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Ошибка сервера: ${response.statusText}`);
            }

            successMessage.style.display = 'block';
            form.style.display = 'none';
            document.querySelector('.student-info').style.display = 'none';
            document.querySelector('.warning').style.display = 'none';
            clearInterval(timerInterval);

        } catch (error) {
            console.error('Ошибка при отправке:', error.message);
            // Теперь показываем любое сообщение об ошибке от сервера
            const errorMessage = error.message.includes("проходили этот тест") || error.message.includes("время вышло")
                ? error.message 
                : 'Произошла ошибка при отправке. Пожалуйста, свяжитесь с преподавателем.'; // Общее сообщение
            alert(errorMessage);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить тест';
        }
    });

    window.addEventListener('beforeunload', (e) => {
        if (successMessage.style.display !== 'block') {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
});