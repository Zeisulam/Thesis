$("form[name=signup_form").submit(function(e) {
 
    var $form = $(this);
    var $error = $form.find(".error");
    var data = $form.serialize();

    $.ajax({
        url: "/user/signup",
        type: "POST",
        data: data,
        dataType: "json",
        success: function(resp) {
            window.location.href = "/login"
        },
        error: function(resp) {
            console.log(resp);
            $error.text(resp.responseJSON.error).removeClass("error--hidden");
        }
    });
    e.preventDefault(); 
})

$("#login_form").submit(function (e) {
    e.preventDefault();

    $.ajax({
        type: "POST",
        url: "/api/user/login",
        data: {
            username: $("#username").val(),
            password: $("#password").val()
        },
        success: function (response) {
            window.location.href = "/api/admin"; // Redirect on successful login
        },
        error: function (xhr) {
            $(".error").removeClass("error--hidden").text(xhr.responseJSON.error);
        }
    });
});