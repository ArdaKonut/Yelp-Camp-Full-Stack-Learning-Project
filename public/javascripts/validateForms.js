// Example starter JavaScript for disabling form submissions if there are invalid fields

(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.validated-form')

  // Loop over them and prevent submission
  // Older way of making an array out of forms
  // Array.prototype.slice.call(forms)
  // Newer syntax for making an array from whatever the query selector returns above.
  Array.from(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
          // preventDefault() is used to prevent the default action that belongs to the event,
          // such as preventing a form from submitting. event. stopPropagation() is used to stop
          // the event from bubbling up to parent elements, preventing any parent event handlers from being executed.
        }

        form.classList.add('was-validated')
      }, false)
    })
})()
