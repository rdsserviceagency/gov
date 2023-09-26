const formDiv = document.getElementById('formDiv');
const form = document.getElementById('myForm');
const editForm = document.getElementById('editForm');
const readOnlyTextbox = document.querySelector('.inputName');
const buttonsBelowTable = document.querySelectorAll('.btn-custom-add');
const closeButton = document.querySelector('close-button');
const deleteButtons = document.querySelectorAll('.delete-button');
const editButtons = document.querySelectorAll('.edit-button');

buttonsBelowTable.forEach((button) => {
    button.addEventListener('click', () => {
        if($('#editForm').is(':visible')){
            closeForm("#editForm")
        }
        if ($('#myForm').is(':visible')) {
            form.reset()
            readOnlyTextbox.value = button.getAttribute('data-pakshakar');
        } else {
            $("#myForm").toggleClass("hidden")
            readOnlyTextbox.value = button.getAttribute('data-pakshakar')
        }
    });
});

deleteButtons.forEach(button => {
    button.addEventListener('click', function () {
        const row = this.closest('tr');
        const id = row.getAttribute('data-id');

        // Send a delete request to the server using the 'id'
        // You can use fetch or another AJAX library for this
        // Example using fetch:
        fetch(`/delete-row?id=${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    // Row deleted successfully, remove it from the table
                    row.remove();
                } else {
                    // Handle error here
                    console.error('Error deleting row');
                }
            })
            .catch(error => {
                console.error('Error deleting row:', error);
            });
    });
});

editButtons.forEach(button => {
    button.addEventListener('click', function () {
        if($('#myForm').is(':visible')){
            closeForm("#myForm")
        }
        if ($('#editForm').is(':visible')) {
            editForm.reset()
        } else {
            $("#editForm").toggleClass("hidden")
        }
        const row = this.closest('tr');
        const id = row.getAttribute('data-id');

        // Send a GET request to the server to retrieve data for the given 'id'
        fetch(`/get-row-data?id=${id}`)
            .then(response => response.json())
            .then(data => {
                // Populate the form fields with the received data
                document.getElementById('name').value = data.name;
                document.getElementById('fatherName').value = data.fatherName;
                document.getElementById('address').value = data.address;
                // Set more fields as needed

                // Show the form
                editForm.style.display = 'block';
            })
            .catch(error => {
                console.error('Error retrieving data:', error);
            });
    });
});

// Handle form submission
editForm.addEventListener('submit', function (event) {
    event.preventDefault();
    // Send a PUT or POST request to the server to save the edited data
    // You can use fetch or another AJAX library for this
    // Example using fetch:
    fetch(`/update-row-data?id=${id}`, {
        method: 'PUT', // or 'POST' if appropriate
        body: new FormData(this), // Serialize form data
    })
        .then(response => {
            if (response.ok) {
                // Data updated successfully, hide the form
                editForm.style.display = 'none';
            } else {
                // Handle error here
                console.error('Error updating data');
            }
        })
        .catch(error => {
            console.error('Error updating data:', error);
        });
});

function closeForm(formID) {
    let formToClose = document.querySelector(formID)
    $(formID).toggleClass("hidden")
    formToClose.reset()
}

$(document).ready(function () {
    // When the page loads, hide both sections
    $('#panCardDetails').hide();
    $('#form60Details').hide();

    // Event handler for radio button change
    $('input[name="panCardRadio"]').change(function () {
        if ($(this).val() === 'Yes') {
            $('#panCardDetails').show();
            $('#form60Details').hide();
            // Make PAN Card fields mandatory
            $('#panNumber, #panCardFile').prop('required', true);
            $('#name, #gender, #occupation').prop('required', false);
        } else if ($(this).val() === 'No') {
            $('#panCardDetails').hide();
            $('#form60Details').show();
            // Make Form 60 fields mandatory
            $('#panNumber, #panCardFile').prop('required', false);
            $('#name, #gender, #occupation').prop('required', true);
        }
    });

    // Trigger the change event to initialize based on default selection
    $('input[name="panCardRadio"]:checked').trigger('change');
});






