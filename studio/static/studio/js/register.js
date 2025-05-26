$(document).ready(function() {
    $('#register-card').hide().fadeIn(500);

    const initInputHandlers = () => {
        $('input').on({
            focus: function() {
                $(this).parent().find('label').css('color', 'var(--secondary)');
            },
            blur: function() {
                $(this).parent().find('label').css('color', 'var(--text)');
            },
            input: function() {
                $(this).removeClass('error-field');
                $(this).parent().removeClass('has-error');
                $(this).next('.field-error').hide();
            }
        });
    };

    initInputHandlers();

    $('#register-form').on('submit', function(e) {
        e.preventDefault();
        const $form = $(this);
        const $btn = $form.find('.submit-btn');
        const $btnText = $btn.find('.btn-text');
        const $spinner = $btn.find('.loading-spinner');

        $btnText.hide();
        $spinner.show();
        $btn.prop('disabled', true);

        $.ajax({
            type: 'POST',
            url: $form.attr('action'),
            data: $form.serialize(),
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
            },
            success: function(response) {
                if (response.success) {
                    window.location.href = response.redirect_url || "/";
                } else if (response.html) {
                    $('#auth-container').html(response.html);
                    initInputHandlers();
                } else if (response.errors) {
                    handleFormErrors(response.errors);
                }
            },
            error: function(xhr) {
                const errorMsg = xhr.responseJSON?.error || 
                               xhr.responseJSON?.message || 
                               'Произошла ошибка. Пожалуйста, попробуйте позже.';
                showToast(errorMsg, 'error');
            },
            complete: function() {
                $btnText.show();
                $spinner.hide();
                $btn.prop('disabled', false);
            }
        });
    });

    const handleFormErrors = (errors) => {
        $('.field-error').hide();
        $('.has-error').removeClass('has-error');
        $('.error-field').removeClass('error-field');

        for (const field in errors) {
            const $field = $(`#id_${field}`);
            const $formGroup = $field.parent();
            
            $formGroup.addClass('has-error');
            $field.addClass('error-field');
            
            let $errorContainer = $field.next('.field-error');
            if ($errorContainer.length === 0) {
                $errorContainer = $(`
                    <div class="field-error">
                        <i class="fas fa-exclamation"></i>
                        <span>${errors[field][0]}</span>
                    </div>
                `);
                $field.after($errorContainer);
            } else {
                $errorContainer.find('span').text(errors[field][0]);
                $errorContainer.show();
            }
        }
    };

    const showToast = (message, type) => {
        const toast = $(`
            <div class="toast-notification ${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `);
        
        $('body').append(toast);
        setTimeout(() => toast.fadeOut(() => toast.remove()), 5000);
    };
});