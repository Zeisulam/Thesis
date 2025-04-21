window.onload = function() {
    // Reset the form fields when the page loads
    const signupForm = document.getElementById("signup_form");
    if (signupForm) {
        signupForm.reset();
    }
};

$(document).ready(function () {
    // Enforce age range (1-99)
    $("input[name='age']").on("input", function () {
        let min = 1;
        let max = 99;
        let value = parseInt($(this).val());

        if (isNaN(value)) {
            $(this).val("");
            return;
        }
        if (value < min) {
            $(this).val(min);
        } else if (value > max) {
            $(this).val(max);
        }
    });

    // Handle signup form submission with AJAX
    $("#signup_form").submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        let formData = {
            access_key: $("input[name='access_key']").val(),
            name: $("input[name='name']").val(),
            email: $("input[name='email']").val(),
            number: $("input[name='number']").val(),
            subject: $("input[name='subject']").val(),
            details: $("textarea[name='details']").val()
        };

        $.ajax({
            url: "https://api.web3forms.com/submit",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function (response) {
                // Display the success message from Web3Forms
                $("#successMessage").text(response.message);
                $("#successModal").show();

                // Close the modal after a delay and redirect to home page
                setTimeout(function() {
                    $("#successModal").hide();
                    window.location.href = "/";
                }, 3000); // 3-second delay
            },
            error: function (xhr) {
                let errorMessage = xhr.responseJSON ? xhr.responseJSON.message : "Submission failed!";
                alert(errorMessage); // Show error message
            }
        });
    });

    const detailsField = $("#details");
    detailsField.on("input", function () {
        if (detailsField.val().trim() !== "") {
            detailsField.addClass("not-empty");
        } else {
            detailsField.removeClass("not-empty");
        }
    });

    // Modal close functionality
    $(".close").on("click", function() {
        $("#successModal").hide();
    });
});

