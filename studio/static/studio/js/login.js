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
            } else if (response.html) {
                $('#login-card').replaceWith(response.html);
                initFormEvents();
            }
        },
        error: function (xhr) {
            alert('Ошибка сервера: ' + (xhr.responseJSON?.error || 'Попробуйте позже'));
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