$(document).ready(function () {

  $("form.contact").on("submit", function (event) {
    event.preventDefault();
    $("form.contact .submit").val("Sending...");
    $.post("https://stackleader.com/contacts", $(this).serialize(), function (data) {
      $('.contact-form').html('<h4>Thank you for your interest!</h4>');
    }).fail(function () {
      $(".contact-form .alert").text("An error occurred.  Please try again.");
      $(".contact-form .alert").removeClass("hidden");
    }).always(function () {
      $("form.contact .submit").val("Send Message");
    });
  });


});


function validateFields(form) {
  var name, error, originalErrorMessage;

  $(form).find('.validate-required[type="checkbox"]').each(function () {
    if (!$('[name="' + $(this).attr('name') + '"]:checked').length) {
      error = 1;
      name = $(this).attr('name').replace('[]', '');
      form.find('.form-error').text('Please tick at least one ' + name + ' box.');
    }
  });

  $(form).find('.validate-required').each(function () {
    if ($(this).val() === '') {
      $(this).addClass('field-error');
      error = 1;
    } else {
      $(this).removeClass('field-error');
    }
  });

  $(form).find('.validate-email').each(function () {
    if (!(/(.+)@(.+){2,}\.(.+){2,}/.test($(this).val()))) {
      $(this).addClass('field-error');
      error = 1;
    } else {
      $(this).removeClass('field-error');
    }
  });

  if (!form.find('.field-error').length) {
    form.find('.form-error').fadeOut(1000);
  }

  return error;
}
