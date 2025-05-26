$(document).ready(function () {
    $('#login-card').css({
        'opacity': '0',
        'transform': 'translateY(20px)'
    });

    setTimeout(() => {
        $('#login-card').css({
            'transition': 'all 0.5s ease',
            'opacity': '1',
            'transform': 'translateY(0)'
        });
    }, 100);

    $('input').on({
        focus: function () {
            $(this).parent().find('label').css('color', 'var(--secondary)');
        },
        blur: function () {
            $(this).parent().find('label').css('color', 'var(--text)');
        }
    });
});