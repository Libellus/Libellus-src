// Sign in the user to the site.
function login() {
    var username = getCookie('username');
    BootstrapDialog.show({
        title: 'Sign in with your organizational email address',
        message: '<input id="username" type="text" class="form-control" value="' + username + '">',
        cssClass: 'type-libellus',
        closable: false,
        buttons: [{
            label: 'Ok',
            cssClass: 'btn-secondary',
            hotkey: 13,
            action: function(dialog) {
                if ($('#username').val() != '') {
                    document.cookie = 'username=' + $('#username').val();
                    $('#show_username').text(getCookie('username'));
                } else {
                    login();
                }
                dialog.close();
            }
        }]
    });
}

$(document).ready(function() {

    /* If the user is not signed in, we ask the user to sign in.
       If the user is already signed in, we just display the current username. */
    if (getCookie('username') == '') {
            login();
    } else {
        $('#show_username').text(getCookie('username'));
    }

    $('#signed_in_as').click(function() {
        login();
    });


});
