
// Открытие модального окна
document.getElementById('openModal').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'block';
});

// Закрытие модального окна
document.getElementsByClassName('close')[0].addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
});

// Закрытие модального окна при клике вне его
window.addEventListener('click', function(event) {
    if (event.target == document.getElementById('modal')) {
        document.getElementById('modal').style.display = 'none';
    }
});

// Отправка формы и вывод данных в консоль
function submitForm() {
    const form = document.getElementById('contactForm');
    const formData = {};

    let isValid = true;

    for (let i = 0; i < form.elements.length; i++) {
        const element = form.elements[i];
        if (element.name && element.value) {
            formData[element.name] = element.value;
        }
    }

    // Проверка email
    const email = formData.email;
    if (!email.includes('@'), !email.includes('.com')) {
        alert('Email must contain "@" symbol or ".com" must contain');
        isValid = false;
    }

    // Проверка номера телефона
    const phone = formData.phone;
    if (!/^\d+$/.test(phone)) {
        alert('Phone number must contain only digits.');
        isValid = false;
    }

    if (isValid) {
        console.log(formData);
        document.getElementById('modal').style.display = 'none';
        clearFormFields();
    }
    function clearFormFields() {
        const form = document.getElementById('contactForm');
        for (let i = 0; i < form.elements.length; i++) {
            const element = form.elements[i];
            element.value = '';
        }
    }
    function scrollToBottom() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }
}