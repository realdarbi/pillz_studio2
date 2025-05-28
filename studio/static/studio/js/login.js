$(document).ready(function () {
    $('#login-card').hide().fadeIn(500);

    initFormEvents();

    $('#login-form').on('submit', handleLoginSubmit);

    $(document).on('click', '.switch-form[data-target="register"]', handleRegisterSwitch);
});

function handleLoginSubmit(e) {
    e.preventDefault();
    const $form = $(this);
    const $btn = $form.find('.login-btn');
    const $spinner = $btn.find('.loading-spinner');
    const $btnText = $btn.find('.btn-text');

    $btnText.hide();
    $spinner.show();
    $btn.prop('disabled', true);

    $.ajax({
        type: 'POST',
        url: $form.attr('action'),
        data: $form.serialize(),
        success: function (response) {
            if (response.success) {
                $('#login-card').fadeOut(300, function () {
                    window.location.href = response.redirect_url || $('#auth-container').data('home-url');
                });
            } else {

                showNotification('error', 'Неверный логин или пароль');


                $form.find('input').addClass('error-field');
                setTimeout(() => {
                    $form.find('input').removeClass('error-field');
                }, 2000);
            }
        },
        error: function (xhr) {
            let errorMessage = 'Ошибка сервера. Попробуйте позже.';
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMessage = xhr.responseJSON.error;
            }
            showNotification('error', errorMessage);
        },
        complete: function () {
            $btnText.show();
            $spinner.hide();
            $btn.prop('disabled', false);
        }
    });
}

function handleRegisterSwitch(e) {
    e.preventDefault();
    const $authContainer = $('#auth-container');

    if ($authContainer.data('transitioning')) return;
    $authContainer.data('transitioning', true);

    $('#login-card').animate({
        'opacity': 0,
        'left': '-100%'
    }, 500, function () {
        $(this).remove();

        $.ajax({
            url: $authContainer.data('register-url'),
            type: "GET",
            dataType: "json",
            success: function (response) {
                if (response.html) {
                    const $registerCard = $(response.html).css({
                        'opacity': 0,
                        'left': '100%'
                    });

                    $authContainer.append($registerCard);

                    $registerCard.animate({
                        'opacity': 1,
                        'left': '0'
                    }, 500, function () {
                        $authContainer.data('transitioning', false);
                    });
                }
            },
            error: function (xhr) {
                console.error("AJAX Error:", xhr.responseText);
                $authContainer.data('transitioning', false);
            }
        });
    });
}

function initFormEvents() {
    $('input').on({
        focus: function () {
            $(this).parent().find('label').css('color', 'var(--secondary)');
        },
        blur: function () {
            $(this).parent().find('label').css('color', 'var(--text)');
        }
    });
}

$(document).ready(function () {
    $('#login-card').hide().fadeIn(500);
    initFormEvents();
    $('#login-form').on('submit', handleLoginSubmit);
    $(document).on('click', '.switch-form[data-target="register"]', handleRegisterSwitch);
});

function showNotification(type, message) {
    const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    const notification = $(`
        <div class="notification ${type}">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
    `);

    $('body').append(notification);

    setTimeout(() => {
        notification.addClass('show');
    }, 50);

    setTimeout(() => {
        notification.removeClass('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}


$(document).ready(function () {
    $('#login-card').hide().fadeIn(500);
    initFormEvents();

    $('#login-form').on('submit', function (e) {
        e.preventDefault();
        const $form = $(this);
        const $btn = $form.find('.login-btn');
        const $spinner = $btn.find('.loading-spinner');
        const $btnText = $btn.find('.btn-text');
        const $notification = $('#auth-notification');
        const $message = $('#notification-message');

        $btnText.hide();
        $spinner.show();
        $btn.prop('disabled', true);

        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: $form.serialize(),
            success: function (response) {
                if (response.success) {
                    $message.text('Вход выполнен успешно!');
                    $notification.removeClass('error').addClass('success show');
                    $('#login-card').fadeOut(300, function () {
                        window.location.href = response.redirect_url || $('#auth-container').data('home-url');
                    });
                } else {
                    showErrorNotification('Неверный логин или пароль');
                    $form.find('input').addClass('error-field');
                    setTimeout(() => {
                        $form.find('input').removeClass('error-field');
                    }, 2000);
                }
            },
            error: function (xhr) {
                let errorMsg = 'Ошибка сервера. Попробуйте позже.';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }
                showErrorNotification(errorMsg);
            },
            complete: function () {
                $btnText.show();
                $spinner.hide();
                $btn.prop('disabled', false);
            }
        });
    });

    $(document).on('click', '.switch-form[data-target="register"]', handleRegisterSwitch);
});

function showErrorNotification(message) {
    const $notification = $('#auth-notification');
    const $message = $('#notification-message');

    $message.text(message);
    $notification.removeClass('success hidden').addClass('error show');

    setTimeout(() => {
        $notification.removeClass('show').addClass('hidden');
    }, 5000);
}



